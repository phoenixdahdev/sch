import { buildResponse } from '@kemuko-org/shared-utils';
import { OptionModelAction } from '@/actions/model-actions';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOptionDto, UpdateOptionDto } from '@dto/options.dto';

@Injectable()
export class OptionsService {
  constructor(private readonly optionModelAction: OptionModelAction) {}

  async findAll(questionId: string) {
    const { payload, paginationMeta } = await this.optionModelAction.find({
      findOptions: { question_id: questionId },
      transactionOptions: {
        useTransaction: false,
      },
      order: { position: 'ASC' },
    });
    return {
      data: { options: payload },
      meta: paginationMeta,
      message: 'Options retrieved successfully',
    };
  }

  async findOne(questionId: string, id: string) {
    const option = await this.optionModelAction.get(
      {
        id,
        question_id: questionId,
      },
      {},
      { options: true },
    );
    if (!option) {
      throw new NotFoundException(
        `Option with ID ${id} not found in question ${questionId}`,
      );
    }
    return buildResponse({ option }, 'Option retrieved successfully');
  }

  async create(questionId: string, createOptionDto: CreateOptionDto) {
    if (!createOptionDto.position) {
      const lastOption = await this.optionModelAction.find({
        findOptions: { question_id: questionId },
        transactionOptions: {
          useTransaction: false,
        },
        order: { position: 'DESC' },
        paginationPayload: { limit: 1, page: 1 },
      });

      const lastOptionData = lastOption.payload[0];
      createOptionDto.position = lastOption ? lastOptionData.position + 1 : 0;
    }
    const option = await this.optionModelAction.create({
      createPayload: {
        ...createOptionDto,
        question_id: questionId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ option }, 'Option created successfully');
  }

  async update(
    questionId: string,
    id: string,
    updateOptionDto: UpdateOptionDto,
  ) {
    await this.findOne(questionId, id);
    const option = await this.optionModelAction.update({
      updatePayload: {
        ...updateOptionDto,
      },
      identifierOptions: { id, question_id: questionId },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ option }, 'Option updated successfully');
  }

  async remove(questionId: string, id: string) {
    await this.optionModelAction.delete({
      identifierOptions: { id, question_id: questionId },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(null, 'Option deleted successfully');
  }
}
