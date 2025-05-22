import { Currency } from '@entities/payment_intent.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
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
}
