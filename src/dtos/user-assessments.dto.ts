import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty({ description: 'Selected option ID(s)' })
  @IsArray()
  @IsNotEmpty()
  option_ids: string[];
}

export class SubmitAssessmentDto {
  @ApiProperty({ description: 'Assessment answers', type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
