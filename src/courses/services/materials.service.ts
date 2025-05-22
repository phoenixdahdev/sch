import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto, UpdateMaterialDto } from '@dto/materials.dto';
import { MaterialModelAction } from '../../actions/model-actions';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class MaterialsService {
  constructor(private materialModelAction: MaterialModelAction) {}

  async findAll(lessonId: string) {
    const materials = await this.materialModelAction.find({
      findOptions: {
        lesson_id: lessonId,
      },
      transactionOptions: {
        useTransaction: false,
      },
      order: { position: 'ASC' },
    });

    return buildResponse(
      { materials: materials.payload },
      'Materials have been retrieved successfully',
    );
  }

  async findOne(lessonId: string, id: string) {
    const material = await this.materialModelAction.get({
      id,
      lesson_id: lessonId,
    });
    if (!material) {
      throw new NotFoundException(
        `Material with ID ${id} not found in lesson ${lessonId}`,
      );
    }
    return buildResponse({ material }, 'Material retrieved successfully');
  }

  async create(lessonId: string, createMaterialDto: CreateMaterialDto) {
    if (!createMaterialDto.position) {
      const { payload: materials } = await this.materialModelAction.find({
        findOptions: { lesson_id: lessonId },
        transactionOptions: { useTransaction: false },
        order: { position: 'DESC' },
        paginationPayload: { limit: 1, page: 1 },
      });

      const lastMaterial = materials[0];
      const position = lastMaterial ? lastMaterial.position + 1 : 0;

      const material = await this.materialModelAction.create({
        createPayload: {
          ...createMaterialDto,
          position,
          lesson_id: lessonId,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
      return buildResponse({ material }, 'Material created successfully');
    }

    const material = await this.materialModelAction.create({
      createPayload: {
        ...createMaterialDto,
        lesson_id: lessonId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ material }, 'Material created successfully');
  }

  async update(
    lessonId: string,
    id: string,
    updateMaterialDto: UpdateMaterialDto,
  ) {
    await this.findOne(lessonId, id);
    const material = await this.materialModelAction.update({
      identifierOptions: { lesson_id: lessonId },
      updatePayload: {
        ...updateMaterialDto,
        lesson_id: lessonId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ material }, 'Material updated successfully');
  }

  async remove(lessonId: string, id: string) {
    await this.findOne(lessonId, id);
    await this.materialModelAction.delete({
      identifierOptions: { lesson_id: lessonId, id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({}, 'Material deleted successfully');
  }
}
