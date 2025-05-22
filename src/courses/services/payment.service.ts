import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CartModelAction,
  CourseModelAction,
  UserCourseModelAction,
} from '@/actions/model-actions';
import { PaymentIntentModelAction } from '../../actions/model-actions';
import { buildResponse, User } from '@kemuko-org/shared-utils';
import { CreatePaymentIntentDto } from '@dto/payment.dto';
import { PaymentIntentStatus } from '@entities/payment_intent.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto'
import { PaystackWebhookEventData, WebHookData } from '@/types/index';

interface PaymentIntentMetadata {
  paystack_reference?: string;
  [key: string]: any;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paystackBaseUrl = 'https://api.paystack.co';
  private readonly paystackSecretKey: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly userCourseModelAction: UserCourseModelAction,
    private readonly cartModelAction: CartModelAction,
    private readonly paymentIntentModelAction: PaymentIntentModelAction,
    private readonly courseModelAction: CourseModelAction,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  private getPaystackHeaders() {
    return {
      Authorization: `Bearer ${this.paystackSecretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createIntent(
    user: User,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const cart = await this.cartModelAction.get(
      { id: createPaymentIntentDto.cart_id, user_id: user.id },
      {},
      { items: true },
    );
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    const paymentIntent = await this.paymentIntentModelAction.create({
      createPayload: {
        user_id: user.id,
        cart_id: cart.id,
        amount: cart.total_price,
        currency: createPaymentIntentDto.currency,
        status: PaymentIntentStatus.PENDING,
        metadata: createPaymentIntentDto.metadata || {},
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    const initializePayload = {
      email: user.email,
      amount: Math.round(cart.total_price * 100),
      currency: createPaymentIntentDto.currency || 'NGN',
      reference: paymentIntent.id,
      callback_url: createPaymentIntentDto.callback_url ?? this.configService.get<string>("PAYSTACK_CALLBACK_URL"),
      metadata: {
        payment_intent_id: paymentIntent.id,
        user_id: user.id,
        cart_id: cart.id,
        ...createPaymentIntentDto.metadata,
      },
    };
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        initializePayload,
        { headers: this.getPaystackHeaders() },
      ),
    );
    if (!response.data.status) {
      await this.paymentIntentModelAction.update({
        identifierOptions: { id: paymentIntent.id },
        updatePayload: { status: PaymentIntentStatus.FAILED },
        transactionOptions: { useTransaction: false },
      });

      throw new InternalServerErrorException('Failed to initialize payment with Paystack');
    }

    const updatedPaymentIntent = await this.paymentIntentModelAction.update({
      identifierOptions: { id: paymentIntent.id },
      updatePayload: {
        metadata: {
          ...paymentIntent.metadata,
          paystack_reference: response.data.data.reference,
          paystack_access_code: response.data.data.access_code,
        },
      },
      transactionOptions: { useTransaction: false },
    });

    return buildResponse(
      {
        payment_intent: updatedPaymentIntent,
        paystack_data: {
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference,
        },
      },
      'Payment intent has been created successfully',
    );
  }


  // async confirmIntent(userId: string, intentId: string) {
  //   return await this.dataSource.transaction(async (manager) => {
  //     const intent = await this.paymentIntentModelAction.get(
  //       { id: intentId, user_id: userId },
  //       {},
  //       { cart: true },
  //     );

  //     if (!intent) throw new NotFoundException('Payment intent not found');
  //     if (intent.status !== PaymentIntentStatus.PENDING) {
  //       throw new BadRequestException(
  //         'Payment intent has already been processed',
  //       );
  //     }
  //     // TODO: Integrate with payment provider (e.g., Stripe, PayPal)
  //     const savedIntent = await this.paymentIntentModelAction.update({
  //       identifierOptions: { id: intentId, user_id: userId },
  //       updatePayload: { status: PaymentIntentStatus.SUCCEEDED },
  //       transactionOptions: {
  //         useTransaction: true,
  //         transaction: manager,
  //       },
  //     });
  //     const cart = await this.cartModelAction.get(
  //       { id: intent.cart_id, user_id: userId },
  //       {},
  //       { items: true },
  //     );

  //     const enrollments = [];

  //     for (const item of cart.items) {
  //       const userCourse = this.userCourseModelAction.create({
  //         createPayload: {
  //           user_id: userId,
  //           course_id: item.course_id,
  //         },
  //         transactionOptions: {
  //           useTransaction: true,
  //           transaction: manager,
  //         },
  //       });
  //       enrollments.push(userCourse);
  //       const course = await this.courseModelAction.get({ id: item.course_id });
  //       await this.courseModelAction.update({
  //         identifierOptions: { id: item.course_id },
  //         updatePayload: {
  //           enrolled_count: course.enrolled_count + 1,
  //         },
  //         transactionOptions: {
  //           useTransaction: true,
  //           transaction: manager,
  //         },
  //       });
  //     }

  //     await Promise.all(enrollments);
  //     await manager.query(`DELETE FROM cart_items WHERE cart_id = $1`, [
  //       cart.id,
  //     ]);
  //     await this.cartModelAction.delete({
  //       identifierOptions: { id: cart.id, user_id: userId },
  //       transactionOptions: {
  //         useTransaction: true,
  //         transaction: manager,
  //       },
  //     });
  //     return buildResponse(
  //       { payment_intent: savedIntent },
  //       'Payment intent has been confirmed successfully',
  //     );
  //   });
  // }

  async confirmIntent(userId: string, intentId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const intent = await this.paymentIntentModelAction.get(
        { id: intentId, user_id: userId },
        {},
        { cart: true },
      );

      if (!intent) {
        throw new NotFoundException('Payment intent not found');
      }

      if (intent.status !== PaymentIntentStatus.PENDING) {
        throw new BadRequestException('Payment intent has already been processed');
      }

      try {

        const metadata: PaymentIntentMetadata = intent.metadata
        const paystackReference = metadata.paystack_reference || intentId;
        const verificationResponse = await firstValueFrom(
          this.httpService.get(
            `${this.paystackBaseUrl}/transaction/verify/${paystackReference}`,
            { headers: this.getPaystackHeaders() },
          ),
        );

        if (!verificationResponse.data.status || verificationResponse.data.data.status !== 'success') {
          throw new BadRequestException('Payment verification failed');
        }


        const expectedAmount = Math.round(intent.amount * 100);
        if (verificationResponse.data.data.amount !== expectedAmount) {
          throw new BadRequestException('Payment amount mismatch');
        }
        const savedIntent = await this.paymentIntentModelAction.update({
          identifierOptions: { id: intentId, user_id: userId },
          updatePayload: {
            status: PaymentIntentStatus.SUCCEEDED,
            metadata: {
              ...intent.metadata,
              paystack_transaction: verificationResponse.data.data,
              confirmed_at: new Date().toISOString(),
            },
          },
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });
        const cart = await this.cartModelAction.get(
          { id: intent.cart_id, user_id: userId },
          {},
          { items: true },
        );

        const enrollments = [];

        for (const item of cart.items) {
          const userCourse = this.userCourseModelAction.create({
            createPayload: {
              user_id: userId,
              course_id: item.course_id,
            },
            transactionOptions: {
              useTransaction: true,
              transaction: manager,
            },
          });
          enrollments.push(userCourse);

          const course = await this.courseModelAction.get({ id: item.course_id });
          await this.courseModelAction.update({
            identifierOptions: { id: item.course_id },
            updatePayload: {
              enrolled_count: course.enrolled_count + 1,
            },
            transactionOptions: {
              useTransaction: true,
              transaction: manager,
            },
          });
        }

        await Promise.all(enrollments);
        await manager.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);
        await this.cartModelAction.delete({
          identifierOptions: { id: cart.id, user_id: userId },
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });

        return buildResponse(
          { payment_intent: savedIntent },
          'Payment intent has been confirmed successfully',
        );
      } catch (error) {
        this.logger.error('Error confirming payment intent:', error);
        await this.paymentIntentModelAction.update({
          identifierOptions: { id: intentId, user_id: userId },
          updatePayload: { status: PaymentIntentStatus.FAILED },
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });

        if (error instanceof BadRequestException || error instanceof NotFoundException) {
          throw error;
        }
        if (error.response?.data) {
          this.logger.error('Paystack API Error:', error.response.data);
          throw new BadRequestException(error.response.data.message || 'Payment verification failed');
        }

        throw new InternalServerErrorException('Failed to confirm payment intent');
      }
    });
  }

  async handleWebhook(webhookData: PaystackWebhookEventData, signature: string) {
    try {
      const hash = crypto
        .createHmac('sha512', this.paystackSecretKey)
        .update(JSON.stringify(webhookData))
        .digest('hex');

      if (hash !== signature) {
        this.logger.warn('Invalid webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }

      this.logger.log(`Webhook received: ${JSON.stringify(webhookData)}`);

      switch (webhookData.event) {
        case 'charge.success':
          await this.handleSuccessfulPayment(webhookData.data);
          break;
        case 'charge.failed':
          await this.handleFailedPayment(webhookData.data);
          break;
        default:
          this.logger.log(`Unhandled webhook event: ${webhookData.event}`);
      }

      return buildResponse({}, 'Webhook has been processed successfully');
    } catch (error) {
      this.logger.error('Error processing webhook:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to process webhook');
    }
  }

  private async handleSuccessfulPayment(paymentData: WebHookData) {
    const reference = paymentData.reference;
    const paymentIntentId: string = paymentData.metadata?.payment_intent_id || reference;
    try {
      const intent = await this.paymentIntentModelAction.get({ id: paymentIntentId });
      if (!intent) {
        this.logger.warn(`Payment intent not found for reference: ${reference}`);
        return;
      }
      if (intent.status === PaymentIntentStatus.SUCCEEDED) {
        this.logger.log(`Payment intent ${paymentIntentId} already processed`);
        return;
      }
      await this.confirmIntent(intent.user_id, paymentIntentId);
    } catch (error) {
      this.logger.error(`Error handling successful payment for reference ${reference}:`, error);
    }
  }

  private async handleFailedPayment(paymentData: WebHookData) {
    const reference = paymentData.reference;
    const paymentIntentId = paymentData.metadata?.payment_intent_id || reference;

    try {
      await this.paymentIntentModelAction.update({
        identifierOptions: { id: paymentIntentId },
        updatePayload: {
          status: PaymentIntentStatus.FAILED,
          metadata: {
            paystack_failure_reason: paymentData.gateway_response,
            failed_at: new Date().toISOString(),
          },
        },
        transactionOptions: { useTransaction: false },
      });
    } catch (error) {
      this.logger.error(`Error handling failed payment for reference ${reference}:`, error);
    }
  }

  async getHistory(userId: string) {
    const intent = await this.paymentIntentModelAction.find({
      findOptions: { user_id: userId },
      order: { created_at: 'DESC' },
      transactionOptions: {
        useTransaction: false,
      },
    });

    const payload = intent.payload;
    const paginationMeta = intent.paginationMeta;

    return {
      data: { payment_intents: payload },
      message: 'Payment intents have been retrieved successfully',
      meta: paginationMeta,
    };
  }

  async getIntent(userId: string, intentId: string) {
    const intent = await this.paymentIntentModelAction.get({
      id: intentId,
      user_id: userId,
    });
    if (!intent) {
      throw new NotFoundException('Payment intent not found');
    }
    return buildResponse(
      { payment_intent: intent },
      'Payment intent has been retrieved successfully',
    );
  }


  async verifyPayment(reference: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.paystackBaseUrl}/transaction/verify/${reference}`,
          { headers: this.getPaystackHeaders() },
        ),
      );

      return buildResponse(
        { verification_data: response.data.data },
        'Payment verification completed',
      );
    } catch (error) {
      if (error.response?.data) {
        this.logger.error('Paystack API Error:', error.response.data);
        throw new BadRequestException(error.response.data.message || 'Payment verification failed');
      }
      throw new InternalServerErrorException('Failed to verify payment');
    }
  }

  async getAllTransactions(page: number = 1, perPage: number = 50) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.paystackBaseUrl}/transaction?page=${page}&perPage=${perPage}`,
          { headers: this.getPaystackHeaders() },
        ),
      );
      return buildResponse(
        { transactions: response.data.data },
        'Transactions retrieved successfully',
      );
    } catch (error) {
      this.logger.error('Error fetching transactions:', error);
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  async getTransactionTimeline(reference: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.paystackBaseUrl}/transaction/timeline/${reference}`,
          { headers: this.getPaystackHeaders() },
        ),
      );
      return buildResponse(
        { timeline: response.data.data },
        'Transaction timeline retrieved successfully',
      );
    } catch (error) {
      this.logger.error('Error fetching transaction timeline:', error);
      throw new InternalServerErrorException('Failed to fetch transaction timeline');
    }
  }

  async refundTransaction(reference: string, amount?: number) {
    try {
      const payload: any = { transaction: reference };
      if (amount) {
        payload.amount = Math.round(amount * 100);
      }
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.paystackBaseUrl}/refund`,
          payload,
          { headers: this.getPaystackHeaders() },
        ),
      );
      return buildResponse(
        { refund: response.data.data },
        'Refund processed successfully',
      );
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      if (error.response?.data) {
        throw new BadRequestException(error.response.data.message || 'Refund failed');
      }
      throw new InternalServerErrorException('Failed to process refund');
    }
  }
}
