import {
  MainCategoryModelAction,
  CategoryModelAction,
} from '@/actions/model-actions';
import {
  CreateMainCategoryDto,
  UpdateMainCategoryDto,
  AssignCategoryToMainCategoryDto,
} from '@dto/main-category.dto';
import { MainCategory } from '@kemuko-org/db-schemas';
import { buildResponse } from '@kemuko-org/shared-utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';

@Injectable()
export class MainCategoriesService {
  constructor(
    private readonly mainCategoryModelAction: MainCategoryModelAction,
    private readonly categoryModelAction: CategoryModelAction,
  ) {}

  async create(createDto: CreateMainCategoryDto) {
    const mainCategory = await this.mainCategoryModelAction.create({
      createPayload: createDto,
      transactionOptions: { useTransaction: false },
    });

    return buildResponse(
      { mainCategory },
      'Main category created successfully',
    );
  }

  async update(id: string, updateDto: UpdateMainCategoryDto) {
    const existing = await this.mainCategoryModelAction.get({ id });
    if (!existing) {
      throw new NotFoundException(`Main category with ID ${id} not found`);
    }

    const updatedMainCategory = await this.mainCategoryModelAction.update({
      identifierOptions: { id },
      updatePayload: updateDto,
      transactionOptions: { useTransaction: false },
    });

    return buildResponse(
      { updatedMainCategory },
      'Main category updated successfully',
    );
  }

  async delete(id: string) {
    const existing = await this.mainCategoryModelAction.get({ id });
    if (!existing) {
      throw new NotFoundException(`Main category with ID ${id} not found`);
    }

    await this.mainCategoryModelAction.delete({
      identifierOptions: { id },
      transactionOptions: { useTransaction: false },
    });

    return buildResponse({}, 'Main category deleted successfully');
  }

  async assignCategory(dto: AssignCategoryToMainCategoryDto) {
    const category = await this.categoryModelAction.get({ id: dto.categoryId });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found`,
      );
    }

    const mainCategory = await this.mainCategoryModelAction.get({
      id: dto.mainCategoryId,
    });
    if (!mainCategory) {
      throw new NotFoundException(
        `Main category with ID ${dto.mainCategoryId} not found`,
      );
    }

    const updatedCategory = await this.categoryModelAction.update({
      identifierOptions: { id: dto.categoryId },
      updatePayload: {
        mainCategory: mainCategory,
      },
      transactionOptions: { useTransaction: false },
    });

    return buildResponse(
      { updatedCategory },
      `Category ${dto.categoryId} assigned to Main Category ${dto.mainCategoryId} successfully`,
    );
  }

  async unassignCategory(categoryId: string) {
    const category = await this.categoryModelAction.get({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const updatedCategory = await this.categoryModelAction.update({
      identifierOptions: { id: categoryId },
      updatePayload: {
        mainCategory: null,
      },
      transactionOptions: { useTransaction: false },
    });

    return buildResponse(
      { updatedCategory },
      `Category ${categoryId} has been unassigned from its main category`,
    );
  }

  async getAll(listOptions: ListRecordGeneric<Partial<MainCategory>>) {
    const { payload, paginationMeta } = await this.mainCategoryModelAction.list(
      {
        filterRecordOptions: {
          is_active: true,
          ...listOptions.filterRecordOptions,
        },
        relations: ['categories', 'categories.courses'],
        paginationPayload: listOptions.paginationPayload,
      },
    );

    const mainCategories = payload.map((mainCategory) => {
      const categories = mainCategory.categories || [];

      const categoryCount = categories.length;

      const totalCourses = categories.reduce((count, category) => {
        return count + (category.courses?.length || 0);
      }, 0);

      return {
        id: mainCategory.id,
        name: mainCategory.name,
        description: mainCategory.description,
        image_url: mainCategory.image_url,
        is_active: mainCategory.is_active,
        categoryCount,
        totalCourses,
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          courseCount: cat.courses?.length || 0,
        })),
      };
    });

    return {
      data: {
        mainCategories,
      },
      message:
        'Main categories with category and course counts retrieved successfully',
      meta: paginationMeta,
    };
  }
}
