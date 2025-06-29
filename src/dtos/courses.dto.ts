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
  IsArray,
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

  @ApiPropertyOptional({ description: 'Detailed description (about)' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Preview video URL' })
  @IsString()
  @IsOptional()
  preview_video_url?: string;

  @ApiProperty({ description: 'Price', default: 0 })
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
    description: 'Course level (Beginner, Intermediate, Advanced)',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ description: 'Creator ID' })
  @IsUUID()
  @IsNotEmpty()
  creator_id: string;

  @ApiPropertyOptional({ description: 'Creator name' })
  @IsString()
  @IsOptional()
  creator_name?: string;

  @ApiPropertyOptional({ description: 'Is published', default: true })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @ApiPropertyOptional({ description: 'Is featured', default: false })
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @ApiPropertyOptional({
    description: 'Course format types (e.g. video, text)',
    type: [String],
    example: ['video', 'text'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  format_types?: string[];

  @ApiPropertyOptional({
    description: 'Flexible learning enabled',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_flexible_learning?: boolean;

  @ApiPropertyOptional({
    description: 'Number of resources',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  resource_count?: number;

  @ApiPropertyOptional({
    description: 'Skills taught in the course',
    type: [String],
    example: ['JavaScript', 'React'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Learning outcomes',
    type: [String],
    example: ['Build a full-stack app', 'Deploy with Docker'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learning_outcomes?: string[];

  @ApiPropertyOptional({
    description: 'Resource descriptions',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resources?: string[];
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

  @ApiPropertyOptional({ description: 'About the course (detailed description)' })
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
    description: 'Course difficulty level (Beginner, Intermediate, Advanced)',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Creator ID (User ID of the course creator)' })
  @IsUUID()
  @IsOptional()
  creator_id?: string;

  @ApiPropertyOptional({ description: 'Creator name' })
  @IsString()
  @IsOptional()
  creator_name?: string;

  @ApiPropertyOptional({ description: 'Is the course published' })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @ApiPropertyOptional({ description: 'Is the course featured' })
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @ApiPropertyOptional({
    description: 'Format types available for the course',
    type: [String],
    example: ['video', 'text', 'audio'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  format_types?: string[];

  @ApiPropertyOptional({ description: 'Is flexible learning enabled' })
  @IsBoolean()
  @IsOptional()
  is_flexible_learning?: boolean;

  @ApiPropertyOptional({
    description: 'Number of resources in the course',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  resource_count?: number;

  @ApiPropertyOptional({
    description: 'Skills that will be learned in this course',
    type: [String],
    example: ['JavaScript', 'React', 'Node.js'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Learning outcomes of the course',
    type: [String],
    example: ['Understand async JS', 'Deploy apps'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learning_outcomes?: string[];

  @ApiPropertyOptional({
    description: 'Course resources description',
    type: [String],
    example: ['PDFs', 'Slides', 'Templates'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resources?: string[];
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
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by flexible learning status',
  })
  isFlexibleLearning?: boolean;

  @IsOptional()
  @IsEnum(CourseLevel)
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by level (Beginner, Intermediate, Advanced)',
    enum: CourseLevel,
  })
  level?: CourseLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by skills',
    type: [String],
    example: ['JavaScript', 'React'],
  })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses by format types',
    type: [String],
    example: ['video', 'text'],
  })
  formatTypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses with minimum rating',
  })
  minRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses with maximum price',
  })
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ApiPropertyOptional({
    required: false,
    description: 'Filter courses with minimum price',
  })
  minPrice?: number;

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