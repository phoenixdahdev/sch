import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateAssessmentDto {
  @ApiProperty({ description: 'Assessment title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Assessment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Assessment position in module',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Time limit in minutes', default: 60 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  time_limit?: number;

  @ApiPropertyOptional({ description: 'Passing score percentage', default: 70 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  passing_score?: number;
}

export class UpdateAssessmentDto {
  @ApiPropertyOptional({ description: 'Assessment title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Assessment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Assessment position in module' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Time limit in minutes' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  time_limit?: number;

  @ApiPropertyOptional({ description: 'Passing score percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  passing_score?: number;
}
