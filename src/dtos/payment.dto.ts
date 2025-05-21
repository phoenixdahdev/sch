import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Cart ID' })
  @IsString()
  @IsNotEmpty()
  cart_id: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
