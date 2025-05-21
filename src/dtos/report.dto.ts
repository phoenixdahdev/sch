import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  MISLEADING_INFORMATION = 'misleading_information',
  SPAM = 'spam',
  OTHER = 'other',
}

export class CreateReportDto {
  @ApiProperty({ description: 'Report reason', enum: ReportReason })
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @ApiProperty({ description: 'Report description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
