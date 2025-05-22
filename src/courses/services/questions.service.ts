import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionModelAction } from '../../actions/model-actions';
import { CreateQuestionDto, UpdateQuestionDto } from '@dto/questions.dto';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionModelAction: QuestionModelAction) {}

  async findAll(assessmentId: string) {
    const { payload, paginationMeta } = await this.questionModelAction.find({
      findOptions: { assessment_id: assessmentId },
      transactionOptions: {
        useTransaction: false,
      },
      order: { position: 'ASC' },
    });
    return {
      data: { questions: payload },
      meta: paginationMeta,
      message: 'Questions retrieved successfully',
    };
  }

  async findOne(assessmentId: string, id: string) {
    const question = await this.questionModelAction.get(
      {
        id,
        assessment_id: assessmentId,
      },
      {},
      { options: true },
    );

    if (!question) {
      throw new NotFoundException(
        `Question with ID ${id} not found in assessment ${assessmentId}`,
      );
    }
    return buildResponse({ question }, 'Question retrieved successfully');
  }

  async create(assessmentId: string, createQuestionDto: CreateQuestionDto) {
    if (!createQuestionDto.position) {
      const lastQuestion = await this.questionModelAction.find({
        findOptions: { assessment_id: assessmentId },
        transactionOptions: { useTransaction: false },
        order: { position: 'DESC' },
        paginationPayload: { limit: 1, page: 1 },
      });
      const lastQuestionData = lastQuestion.payload[0];
      createQuestionDto.position = lastQuestion
        ? lastQuestionData.position + 1
        : 0;
    }
    const question = await this.questionModelAction.create({
      createPayload: {
        ...createQuestionDto,
        assessment_id: assessmentId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return buildResponse({ question }, 'Question created successfully');
  }

  async update(
    assessmentId: string,
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    await this.findOne(assessmentId, id);
    const question = await this.questionModelAction.update({
      identifierOptions: {
        id,
        assessment_id: assessmentId,
      },
      updatePayload: {
        ...updateQuestionDto,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ question }, 'Question updated successfully');
  }

  async remove(assessmentId: string, id: string) {
    await this.findOne(assessmentId, id);
    await this.questionModelAction.delete({
      identifierOptions: {
        id,
        assessment_id: assessmentId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({}, 'Question deleted successfully');
  }

  async reorder(assessmentId: string, questionIds: string[]) {
    const existingQuestions = await this.questionModelAction.find({
      findOptions: { assessment_id: assessmentId },
      transactionOptions: { useTransaction: false },
    });

    const existingIds = new Set(existingQuestions.payload.map((q) => q.id));
    for (const id of questionIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(
          `Question ID ${id} not found in assessment ${assessmentId}`,
        );
      }
    }

    await Promise.all(
      questionIds.map((id, index) =>
        this.questionModelAction.update({
          identifierOptions: { id, assessment_id: assessmentId },
          updatePayload: { position: index },
          transactionOptions: { useTransaction: false },
        }),
      ),
    );

    return this.findAll(assessmentId);
  }
}
