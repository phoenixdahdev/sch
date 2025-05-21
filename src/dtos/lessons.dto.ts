import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Lesson position in module', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsString()
  @IsOptional()
  video_url?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  duration_in_minutes?: number;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Lesson title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Lesson position in module' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsString()
  @IsOptional()
  video_url?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  duration_in_minutes?: number;
}
