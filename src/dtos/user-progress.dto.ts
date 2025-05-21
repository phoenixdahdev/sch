import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProgressDto {
  @ApiPropertyOptional({ description: 'Watched time in seconds' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  watch_time_in_seconds?: number;

  @ApiPropertyOptional({ description: 'Is lesson completed' })
  @IsBoolean()
  @IsOptional()
  is_completed?: boolean;

  @ApiPropertyOptional({ description: 'Last video position in seconds' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  last_position?: number;
}
