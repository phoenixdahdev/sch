import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  MULTIPLE_ANSWER = 'multiple-answer',
  TRUE_FALSE = 'true-false',
  FILL_IN_BLANK = 'fill-in-blank',
  ESSAY = 'essay',
}

class OptionDto {
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

export class CreateQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'Question type', enum: QuestionType })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @ApiPropertyOptional({
    description: 'Question position in assessment',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Points for this question', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  points?: number;

  @ApiPropertyOptional({
    description: 'Options for this question',
    type: [OptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ description: 'Question text' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'Question type', enum: QuestionType })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({ description: 'Question position in assessment' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Points for this question' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  points?: number;
}
