import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for course title or description',
  })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({
    description: 'Limit number of courses returned',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}

export class AdvancedSearchDto extends SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by category ID(s)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  category_id?: string[];

  @ApiPropertyOptional({
    description: 'Filter by course level',
    enum: ['beginner', 'intermediate', 'advanced'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsIn(['beginner', 'intermediate', 'advanced'], { each: true })
  @Type(() => String)
  level?: string[];

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price_min?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price_max?: number;

  @ApiPropertyOptional({ description: 'Minimum average rating' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating_min?: number;

  @ApiPropertyOptional({
    description: 'Sort by a field',
    enum: ['price', 'rating', 'popularity', 'newest'],
  })
  @IsOptional()
  @IsString()
  sort_by?: 'price' | 'rating' | 'popularity' | 'newest';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}
