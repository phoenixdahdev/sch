import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LessonModelAction,
  ModuleModelAction,
} from '../../actions/model-actions';
import { CreateLessonDto, UpdateLessonDto } from '@dto/lessons.dto';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class LessonsService {
  constructor(
    private readonly moduleModelAction: ModuleModelAction,
    private readonly lessonmodelAction: LessonModelAction,
  ) {}

  async findAll(moduleId: string) {
    const { payload, paginationMeta } = await this.lessonmodelAction.list({
      filterRecordOptions: { module_id: moduleId },
      order: { position: 'ASC' },
    });
    return {
      data: {
        lesson: payload,
      },
      meta: paginationMeta,
      message: 'Lesson have been retrived successfully',
    };
  }

  async findOne(moduleId: string, id: string) {
    const lesson = await this.lessonmodelAction.get({
      id,
      module_id: moduleId,
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson with ID ${id} not found in module ${moduleId}`,
      );
    }

    return buildResponse({ lesson }, 'Lesson retrived successfully');
  }

  async create(moduleId: string, createLessonDto: CreateLessonDto) {
    const module = await this.moduleModelAction.get(
      { id: moduleId },
      {},
      { course: true },
    );

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    if (!createLessonDto.position) {
      const lastLesson = await this.lessonmodelAction.get(
        { module_id: moduleId },
        { order: { position: 'DESC' } },
      );
      createLessonDto.position = lastLesson ? lastLesson.position + 1 : 0;
    }
    const lesson = await this.lessonmodelAction.create({
      createPayload: { ...createLessonDto, module_id: moduleId },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ lesson }, 'Lesson Created successfully');
  }

  async update(moduleId: string, id: string, updateLessonDto: UpdateLessonDto) {
    const module = await this.moduleModelAction.get(
      { id: moduleId },
      {},
      { course: true },
    );
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    const updatedLesson = await this.lessonmodelAction.update({
      updatePayload: updateLessonDto,
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(
      { lesson: updatedLesson },
      'Lesson updated successfully',
    );
  }

  async remove(moduleId: string, id: string) {
    const module = await this.moduleModelAction.get(
      { id: moduleId },
      {},
      { course: true },
    );
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    await this.lessonmodelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(null, 'Lesson deleted successfully');
  }

  async reorder(moduleId: string, lessonIds: string[]) {
    const module = await this.moduleModelAction.get(
      { id: moduleId },
      {},
      { course: true },
    );
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    const updates = lessonIds.map((id, index) => {
      return this.lessonmodelAction.update({
        identifierOptions: { id },
        updatePayload: { position: index },
        transactionOptions: {
          useTransaction: false,
        },
      });
    });
    await Promise.all(updates);
    return this.findAll(moduleId);
  }
}
