import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  IsEnum,
} from 'class-validator';
import { PaginationValidator } from '@kemuko-org/shared-utils';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseSortBy {
  CREATED_AT = 'created_at',
  PRICE = 'price',
  RATING = 'average_rating',
  ENROLLED = 'enrolled_count',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'About the course (detailed description)',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ description: 'Course thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Preview video URL' })
  @IsString()
  @IsOptional()
  preview_video_url?: string;

  @ApiProperty({ description: 'Course price', default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: 'Is the course free', default: false })
  @IsBoolean()
  @IsOptional()
  is_free?: boolean;

  @ApiPropertyOptional({ description: 'Total hours of content', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  total_hours?: number;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: CourseLevel,
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Course title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Course description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'About the course (detailed description)',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ description: 'Course thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Preview video URL' })
  @IsString()
  @IsOptional()
  preview_video_url?: string;

  @ApiPropertyOptional({ description: 'Course price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ description: 'Is the course free' })
  @IsBoolean()
  @IsOptional()
  is_free?: boolean;

  @ApiPropertyOptional({ description: 'Total hours of content' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  total_hours?: number;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: CourseLevel,
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Is the course published' })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}

export class CourseFilterDto extends PaginationValidator {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by title or description',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by category ID',
  })
  categoryId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by creator ID',
  })
  creatorId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by featured status',
  })
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by published status',
  })
  isPublished?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by free status',
  })
  isFree?: boolean;

  @IsOptional()
  @IsEnum(CourseLevel)
  @ApiPropertyOptional({
    required: false,
    description: 'Sort courses by field',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by level (Beginner, Intermediate, Advanced)',
  })
  level?: CourseLevel.BEGINNER;

  @IsOptional()
  @IsEnum(CourseSortBy)
  @ApiPropertyOptional({
    required: false,
    description: 'Sort courses by field',
    enum: CourseSortBy,
    default: CourseSortBy.CREATED_AT,
  })
  sortBy?: CourseSortBy = CourseSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortDirection)
  @ApiPropertyOptional({
    required: false,
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  sortDirection?: SortDirection = SortDirection.DESC;
}
