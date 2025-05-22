import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum MaterialType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  LINK = 'link',
  IMAGE = 'image',
  AUDIO = 'audio',
}

export class CreateMaterialDto {
  @ApiProperty({ description: 'Material title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Material description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Material type', enum: MaterialType })
  @IsEnum(MaterialType)
  @IsNotEmpty()
  type: MaterialType;

  @ApiProperty({ description: 'Material URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: 'Material position in lesson',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;
}

export class UpdateMaterialDto {
  @ApiPropertyOptional({ description: 'Material title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Material description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Material type', enum: MaterialType })
  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @ApiPropertyOptional({ description: 'Material URL' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Material position in lesson' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;
}
