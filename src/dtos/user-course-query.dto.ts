import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationValidator } from '@kemuko-org/shared-utils';

export class UserCourseQueryDto extends PaginationValidator {
  @ApiPropertyOptional({
    description: 'Course status filter: all | in-progress | completed',
    enum: ['all', 'in-progress', 'completed'],
    example: 'in-progress',
  })
  @IsOptional()
  @IsIn(['all', 'in-progress', 'completed'])
  status?: 'all' | 'in-progress' | 'completed';
}
