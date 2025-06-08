import {
    Controller,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Get,
    Query,
} from '@nestjs/common';
import { MainCategoriesService } from '../services/main-categories.service';
import {
    CreateMainCategoryDto,
    UpdateMainCategoryDto,
    AssignCategoryToMainCategoryDto,
} from '@dto/main-category.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
    AuthGuard,
    PaginationValidator,
    Roles,
    UserType,
} from '@kemuko-org/shared-utils';

@ApiTags('Main Categories')
@Controller('main-categories')
export class MainCategoriesController {
    constructor(private readonly mainCategoriesService: MainCategoriesService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all main categories with subcategory and course counts',
    })
    async getAll(@Query() pagination?: PaginationValidator) {
        const listOptions = {
            filterRecordOptions: {},
            paginationPayload: {
                page: parseInt(pagination?.page) || 1,
                limit: parseInt(pagination?.limit) || 10,
            },
        };
        return this.mainCategoriesService.getAll(listOptions);
    }

    @Post()
    @UseGuards(AuthGuard)
    @Roles([UserType.Admin])
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a main category (Admin only)' })
    async create(@Body() dto: CreateMainCategoryDto) {
        return this.mainCategoriesService.create(dto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @Roles([UserType.Admin])
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a main category (Admin only)' })
    async update(@Param('id') id: string, @Body() dto: UpdateMainCategoryDto) {
        return this.mainCategoriesService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Roles([UserType.Admin])
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a main category (Admin only)' })
    async delete(@Param('id') id: string) {
        return this.mainCategoriesService.delete(id);
    }

    @Post('assign-category')
    @UseGuards(AuthGuard)
    @Roles([UserType.Admin])
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Assign a category to a main category (Admin only)',
    })
    async assignCategory(@Body() dto: AssignCategoryToMainCategoryDto) {
        return this.mainCategoriesService.assignCategory(dto);
    }

    @Post('unassign-category/:categoryId')
    @UseGuards(AuthGuard)
    @Roles([UserType.Admin])
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Unassign a category from its main category (Admin only)',
    })
    async unassignCategory(@Param('categoryId') categoryId: string) {
        return this.mainCategoriesService.unassignCategory(categoryId);
    }
}
