import { CreatePaymentIntentDto, VerifyPaymentDto } from '@dto/payment.dto';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { PaystackWebhookEventData } from '@/types/index';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create payment intent with Paystack (requires authentication)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    schema: {
      example: {
        data: {
          payment_intent: {
            id: 'intent-123',
            user_id: 'user-123',
            cart_id: 'cart-123',
            amount: 10000,
            currency: 'NGN',
            status: 'pending',
          },
          paystack_data: {
            authorization_url: 'https://checkout.paystack.com/xyz',
            access_code: 'access_code_123',
            reference: 'trx_reference_123',
          },
        },
        message: 'Payment intent has been created successfully',
      },
    },
  })
  async createIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.createIntent(user, createPaymentIntentDto);
  }

  @Post('confirm-intent/:intentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Confirm payment intent after successful payment (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed and courses enrolled successfully',
  })
  async confirmIntent(
    @Param('intentId') intentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.confirmIntent(user.id, intentId);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify payment status with Paystack (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verification completed',
  })
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(verifyPaymentDto.reference);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle Paystack webhook events (public endpoint)',
    description:
      'This endpoint is called by Paystack to handle webhook events. Signature verification is required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() webhookData: PaystackWebhookEventData,
  ) {
    return this.paymentService.handleWebhook(webhookData, signature);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment history (requires authentication)',
  })
  async getHistory(@CurrentUser() user: User) {
    return this.paymentService.getHistory(user.id);
  }

  @Get('transactions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all transactions from Paystack (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async getAllTransactions() {
    return this.paymentService.getAllTransactions();
  }

  @Get('transaction/timeline/:reference')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get transaction timeline from Paystack (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction timeline retrieved successfully',
  })
  async getTransactionTimeline(@Param('reference') reference: string) {
    return this.paymentService.getTransactionTimeline(reference);
  }

  @Post('refund/:reference')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Process refund for a transaction (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
  })
  async refundTransaction(
    @Param('reference') reference: string,
    @Body('amount') amount?: number,
  ) {
    return this.paymentService.refundTransaction(reference, amount);
  }

  @Get(':intentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment intent by ID (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent retrieved successfully',
  })
  async getIntent(
    @Param('intentId') intentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.getIntent(user.id, intentId);
  }
}
