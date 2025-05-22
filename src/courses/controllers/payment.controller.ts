import { CreatePaymentIntentDto } from '@dto/payment.dto';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create-intent')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create payment intent (requires authentication)',
  })
  async createIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.createIntent(user.id, createPaymentIntentDto);
  }

  @Post('confirm-intent/:intentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm payment intent (requires authentication)',
  })
  async confirmIntent(
    @Param('intentId') intentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.confirmIntent(user.id, intentId);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Payment service webhook (public endpoint)',
    description: 'This endpoint is called by the payment provider to handle webhook events.',
  })
  webhook(@Body() webhookData: unknown) {
    return this.paymentService.handleWebhook(webhookData);
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

  @Get(':intentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment intent by ID (requires authentication)',
  })
  async getIntent(
    @Param('intentId') intentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.getIntent(user.id, intentId);
  }
}
