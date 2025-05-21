import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CartModelAction,
  CourseModelAction,
  UserCourseModelAction,
} from '@/actions/model-actions';
import { PaymentIntentModelAction } from '../../actions/model-actions';
import { buildResponse } from '@kemuko-org/shared-utils';
import { CreatePaymentIntentDto } from '@dto/payment.dto';
import { PaymentIntentStatus } from '@entities/payment_intent.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userCourseModelAction: UserCourseModelAction,
    private readonly cartModelAction: CartModelAction,
    private readonly paymentIntentModelAction: PaymentIntentModelAction,
    private readonly courseModelAction: CourseModelAction,
  ) {}

  async createIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const cart = await this.cartModelAction.get(
      { id: createPaymentIntentDto.cart_id, user_id: userId },
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
        user_id: userId,
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
    // TODO: Integrate with payment provider (e.g., Stripe, PayPal)
    return buildResponse(
      { payment_intent: paymentIntent },
      'Payment intent has been created successfully',
    );
  }

  // async confirmIntent(userId: string, intentId: string) {
  //     const intent = await this.paymentIntentModelAction.get({ id: intentId, user_id: userId }, {}, { cart: true });
  //     if (!intent) {
  //         throw new NotFoundException('Payment intent not found');
  //     }
  //     if (intent.status !== PaymentIntentStatus.PENDING) {
  //         throw new BadRequestException('Payment intent has already been processed');
  //     }
  //     // TODO: Integrate with payment provider (e.g., Stripe, PayPal)
  //     const savedIntent = await this.paymentIntentModelAction.update({
  //         identifierOptions: { id: intentId, user_id: userId },
  //         updatePayload: { status: PaymentIntentStatus.SUCCEEDED },
  //         transactionOptions: {
  //             useTransaction: false,
  //         },
  //     })

  //     const cart = await this.cartModelAction.get({ id: intent.cart_id, user_id: userId }, {}, { items: true });
  //     const enrollments = [];

  //     for (const item of cart.items) {
  //         const userCourse = this.userCourseModelAction.create({
  //             createPayload: {
  //                 user_id: userId,
  //                 course_id: item.course_id,
  //             },
  //             transactionOptions: {
  //                 useTransaction: false,
  //             },
  //         })
  //         enrollments.push(userCourse);
  //         const course = await this.courseModelAction.get({ id: item.course_id });
  //         await this.courseModelAction.update({
  //             identifierOptions: { id: item.course_id },
  //             updatePayload: {
  //                 enrolled_count: course.enrolled_count++,
  //             },
  //             transactionOptions: {
  //                 useTransaction: false,
  //             },
  //         })
  //     }

  //     await Promise.all(enrollments);

  //     // await this.cartRepository.update(cart.id, { total_price: 0 });
  //     // await this.cartRepository.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);
  //     await this.cartModelAction.delete({
  //         identifierOptions: { id: cart.id, user_id: userId },
  //         transactionOptions: {
  //             useTransaction: false,
  //         },
  //     })
  //     return buildResponse(
  //         { payment_intent: savedIntent },
  //         'Payment intent has been confirmed successfully',);
  // }
  async confirmIntent(userId: string, intentId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const intent = await this.paymentIntentModelAction.get(
        { id: intentId, user_id: userId },
        {},
        { cart: true },
      );

      if (!intent) throw new NotFoundException('Payment intent not found');
      if (intent.status !== PaymentIntentStatus.PENDING) {
        throw new BadRequestException(
          'Payment intent has already been processed',
        );
      }
      const savedIntent = await this.paymentIntentModelAction.update({
        identifierOptions: { id: intentId, user_id: userId },
        updatePayload: { status: PaymentIntentStatus.SUCCEEDED },
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
      await manager.query(`DELETE FROM cart_items WHERE cart_id = $1`, [
        cart.id,
      ]);
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
    });
  }

  handleWebhook(webhookData: any) {
    this.logger.log(`Webhook received: ${JSON.stringify(webhookData)}`);
    return buildResponse({}, 'Webhook has been received successfully');
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
}
