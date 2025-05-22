import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssessmentDto, UpdateAssessmentDto } from '@dto/assessments.dto';
import { AssessmentModelAction } from '../../actions/model-actions';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class AssessmentsService {
  constructor(private readonly assessmentModelAction: AssessmentModelAction) {}

  async findAll(moduleId: string) {
    const { payload, paginationMeta } = await this.assessmentModelAction.find({
      findOptions: { module_id: moduleId },
      transactionOptions: {
        useTransaction: false,
      },
      order: { position: 'ASC' },
    });
    return {
      data: { assessments: payload },
      meta: paginationMeta,
      message: 'Assessments retrieved successfully',
    };
  }

  async findOne(moduleId: string, id: string) {
    const assessment = await this.assessmentModelAction.get({
      id,
      module_id: moduleId,
    });
    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${id} not found in module ${moduleId}`,
      );
    }
    return buildResponse({ assessment }, 'Assessment retrieved successfully');
  }

  async create(moduleId: string, createAssessmentDto: CreateAssessmentDto) {
    if (!createAssessmentDto.position) {
      const lastAssessment = await this.assessmentModelAction.find({
        findOptions: { module_id: moduleId },
        transactionOptions: { useTransaction: false },
        order: { position: 'DESC' },
        paginationPayload: { limit: 1, page: 1 },
      });
      const lastAssessmentData = lastAssessment.payload[0];
      createAssessmentDto.position = lastAssessment
        ? lastAssessmentData.position + 1
        : 0;
    }
    const assessment = await this.assessmentModelAction.create({
      createPayload: {
        ...createAssessmentDto,
        module_id: moduleId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ assessment }, 'Assessment created successfully');
  }

  async update(
    moduleId: string,
    id: string,
    updateAssessmentDto: UpdateAssessmentDto,
  ) {
    await this.findOne(moduleId, id);
    const updateAssessment = await this.assessmentModelAction.update({
      identifierOptions: {
        id,
        module_id: moduleId,
      },
      updatePayload: {
        ...updateAssessmentDto,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(
      { assessment: updateAssessment },
      'Assessment updated successfully',
    );
  }

  async remove(moduleId: string, id: string) {
    await this.findOne(moduleId, id);
    await this.assessmentModelAction.delete({
      identifierOptions: {
        id,
        module_id: moduleId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({}, 'Assessment deleted successfully');
  }
}
