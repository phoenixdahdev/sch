import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentIntentDto } from '../dtos/payment.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create payment intent' })
  async createIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req,
  ) {
    return this.paymentService.createIntent(
      req.user.id,
      createPaymentIntentDto,
    );
  }

  @Post('confirm-intent/:intentId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Confirm payment intent' })
  async confirmIntent(@Param('intentId') intentId: string, @Request() req) {
    return this.paymentService.confirmIntent(req.user.id, intentId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment service webhook' })
  async webhook(@Body() webhookData: any) {
    return this.paymentService.handleWebhook(webhookData);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payment history' })
  async getHistory(@Request() req) {
    return this.paymentService.getHistory(req.user.id);
  }

  @Get(':intentId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payment intent' })
  async getIntent(@Param('intentId') intentId: string, @Request() req) {
    return this.paymentService.getIntent(req.user.id, intentId);
  }
}
