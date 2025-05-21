import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  Min,
  IsArray,
  IsUUID,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Discount type', enum: DiscountType })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discount_type: DiscountType;

  @ApiProperty({ description: 'Discount value' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount_value: number;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @ApiPropertyOptional({ description: 'Maximum number of uses' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  max_uses?: number;

  @ApiPropertyOptional({ description: 'Applicable course IDs' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  applicable_course_ids?: string[];
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({ description: 'Promotion code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Discount type', enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;

  @ApiPropertyOptional({ description: 'Discount value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount_value?: number;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @ApiPropertyOptional({ description: 'Maximum number of uses' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  max_uses?: number;

  @ApiPropertyOptional({ description: 'Applicable course IDs' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  applicable_course_ids?: string[];
}
