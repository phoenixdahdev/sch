import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CourseModelAction,
  ModuleModelAction,
} from '../../actions/model-actions';
import { CreateModuleDto, UpdateModuleDto } from '@dto/modules.dto';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class ModulesService {
  constructor(
    private readonly moduleModelAction: ModuleModelAction,
    private readonly courseModelAction: CourseModelAction,
  ) {}

  async findAll(courseId: string) {
    const { payload, paginationMeta } = await this.moduleModelAction.list({
      filterRecordOptions: { course_id: courseId },
      relations: { course: true },
      order: { position: 'ASC' },
    });
    return {
      data: { modules: payload },
      message: 'Modules have been retrieved successfully',
      meta: paginationMeta,
    };
  }

  async findOne(courseId: string, id: string) {
    const module = await this.moduleModelAction.get({
      id,
      course_id: courseId,
    });
    if (!module) {
      throw new NotFoundException(
        `Module with ID ${id} not found in course ${courseId}`,
      );
    }

    return buildResponse({ module }, 'Module retrieved successfully');
  }

  async create(courseId: string, createModuleDto: CreateModuleDto) {
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (!createModuleDto.position) {
      const lastModule = await this.moduleModelAction.get(
        { course_id: courseId },
        { order: { position: 'DESC' } },
      );
      createModuleDto.position = lastModule ? lastModule.position + 1 : 0;
    }
    const module = await this.moduleModelAction.create({
      createPayload: {
        ...createModuleDto,
        course_id: courseId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ module }, 'Module created successfully');
  }

  async update(courseId: string, id: string, updateModuleDto: UpdateModuleDto) {
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    await this.findOne(courseId, id);
    const updatedMoudle = await this.moduleModelAction.update({
      identifierOptions: { id },
      updatePayload: updateModuleDto,
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ updatedMoudle }, 'Module updated successfully');
  }

  async remove(courseId: string, id: string) {
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    await this.findOne(courseId, id);
    await this.moduleModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(null, 'Module deleted successfully');
  }

  async reorder(courseId: string, moduleIds: string[]) {
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    const updates = moduleIds.map((id, index) => {
      return this.moduleModelAction.update({
        identifierOptions: { id },
        updatePayload: { position: index },
        transactionOptions: {
          useTransaction: false,
        },
      });
    });
    await Promise.all(updates);
    return this.findAll(courseId);
  }
}
