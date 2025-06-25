
import { Currency } from '@kemuko-org/db-schemas';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
  IsUrl,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Cart ID' })
  @IsString()
  @IsNotEmpty()
  cart_id: string;

  @ApiProperty({
    description: 'Currency',
    enum: Currency,
    example: Currency.USD,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Callback URL after payment completion',
    example: 'https://yourapp.com/payment/success',
  })
  @IsOptional()
  @IsUrl()
  callback_url?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Paystack payment reference',
    example: 'trx_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  reference: string;
}
