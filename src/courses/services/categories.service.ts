
import { buildResponse } from '@kemuko-org/shared-utils';
import { CategoryModelAction } from '@/actions/model-actions';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from '@dto/categories.dto';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';
import { Category } from '@kemuko-org/db-schemas';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesModelAction: CategoryModelAction) {}

  async findAll(listOptions: ListRecordGeneric<Partial<Category>>) {
    const { payload, paginationMeta } = await this.categoriesModelAction.list({
      filterRecordOptions: {
        is_active: true,
        ...listOptions.filterRecordOptions,
      },
      paginationPayload: listOptions.paginationPayload,
    });
    return {
      data: {
        categories: payload,
      },
      message: 'Categories have been retrieved successfully',
      meta: paginationMeta,
    };
  }

  async findOne(id: string) {
    const category = await this.categoriesModelAction.get({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return buildResponse(
      { category },
      `Category with ID ${id} has been retrieved successfully`,
    );
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesModelAction.create({
      createPayload: createCategoryDto,
      transactionOptions: {
        useTransaction: false,
      },
    });

    return {
      data: { category },
      message: 'Category has been created successfully',
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    const updatedCategory = await this.categoriesModelAction.update({
      identifierOptions: { id },
      updatePayload: updateCategoryDto,
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(
      { updatedCategory },
      `Category with ID ${id} has been updated successfully`,
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.categoriesModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return buildResponse(
      {},
      `Category with ID ${id} has been deleted successfully`,
    );
  }
}
