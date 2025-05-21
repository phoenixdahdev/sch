import { CreatePaymentIntentDto } from '@dto/payment.dto';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create payment intent' })
  async createIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.createIntent(user.id, createPaymentIntentDto);
  }

  @Post('confirm-intent/:intentId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Confirm payment intent' })
  async confirmIntent(
    @Param('intentId') intentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.confirmIntent(user.id, intentId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment service webhook' })
  webhook(@Body() webhookData: unknown) {
    return this.paymentService.handleWebhook(webhookData);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payment history' })
  async getHistory(@CurrentUser() user: User) {
    return this.paymentService.getHistory(user.id);
  }

  @Get(':intentId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payment intent' })
  async getIntent(
    @Param('intentId') intentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.getIntent(user.id, intentId);
  }
}
