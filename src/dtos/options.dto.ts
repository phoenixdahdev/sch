import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOptionDto {
  @ApiProperty({ description: 'Option text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'Is this option correct' })
  @IsBoolean()
  is_correct: boolean;

  @ApiPropertyOptional({ description: 'Option position', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;
}

export class UpdateOptionDto {
  @ApiPropertyOptional({ description: 'Option text' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'Is this option correct' })
  @IsBoolean()
  @IsOptional()
  is_correct?: boolean;

  @ApiPropertyOptional({ description: 'Option position' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;
}
