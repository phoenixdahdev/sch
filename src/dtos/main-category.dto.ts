import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMainCategoryDto {
    @ApiProperty({ description: 'The name of the main category' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'A brief description of the main category' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'URL to an image representing the main category' })
    @IsOptional()
    @IsString()
    image_url?: string;

    @ApiPropertyOptional({ description: 'Whether the main category is active or not', default: true })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateMainCategoryDto {
    @ApiPropertyOptional({ description: 'Updated name of the main category' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Updated description of the main category' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Updated image URL for the main category' })
    @IsOptional()
    @IsString()
    image_url?: string;

    @ApiPropertyOptional({ description: 'Whether the main category is active', default: true })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class AssignCategoryToMainCategoryDto {
    @ApiProperty({ description: 'The ID of the category to assign' })
    @IsNotEmpty()
    @IsString()
    categoryId: string;

    @ApiProperty({ description: 'The ID of the main category to assign the category to' })
    @IsNotEmpty()
    @IsString()
    mainCategoryId: string;
}
