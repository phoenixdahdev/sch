import { In } from 'typeorm';
import { Promotion } from '@entities/promotion.entity';
import { buildResponse } from '@kemuko-org/shared-utils';
import { CreatePromotionDto, UpdatePromotionDto } from '@dto/promotion.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PromotionModelAction,
  CourseModelAction,
} from '../../actions/model-actions';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';

@Injectable()
export class PromotionService {
  constructor(
    private readonly promotionModelAction: PromotionModelAction,
    private readonly courseModelAction: CourseModelAction,
  ) {}

  async findAll(listOption: ListRecordGeneric<Partial<Promotion>>) {
    const promotions = await this.promotionModelAction.list(listOption);
    return {
      data: { promotions: promotions.payload },
      meta: promotions.paginationMeta,
      message: 'Promotions retrieved successfully',
    };
  }
  async findOne(id: string) {
    const promotion = await this.promotionModelAction.get(
      { id },
      {},
      { applicable_courses: true },
    );
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return buildResponse({ promotion }, 'Promotion retrieved successfully');
  }
  async create(createPromotionDto: CreatePromotionDto) {
    let courses = [];
    if (
      createPromotionDto.applicable_course_ids &&
      createPromotionDto.applicable_course_ids.length > 0
    ) {
      const result = await this.courseModelAction.find({
        findOptions: {
          id: In(createPromotionDto.applicable_course_ids),
        },
        transactionOptions: {
          useTransaction: false,
        },
      });

      courses = result.payload;
    }

    const promotion = await this.promotionModelAction.create({
      createPayload: {
        ...createPromotionDto,
        applicable_courses: courses,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ promotion }, 'Promotion created successfully');
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    await this.findOne(id);

    let courses = undefined;

    if (updatePromotionDto.applicable_course_ids !== undefined) {
      courses =
        updatePromotionDto.applicable_course_ids.length > 0
          ? (
              await this.courseModelAction.find({
                findOptions: {
                  id: In(updatePromotionDto.applicable_course_ids),
                },
                transactionOptions: {
                  useTransaction: false,
                },
              })
            ).payload
          : [];
    }

    const updatedPromotion = await this.promotionModelAction.update({
      identifierOptions: { id },
      updatePayload: {
        ...updatePromotionDto,
        ...(courses !== undefined && { applicable_courses: courses }),
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return buildResponse(
      { promotion: updatedPromotion },
      'Promotion updated successfully',
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.promotionModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(null, 'Promotion deleted successfully');
  }

  async toggleActivation(id: string, isActive: boolean) {
    await this.findOne(id);
    const promotion = await this.promotionModelAction.update({
      identifierOptions: { id },
      updatePayload: {
        is_active: isActive,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    const message = isActive
      ? 'Promotion activated successfully'
      : 'Promotion deactivated successfully';
    return buildResponse({ promotion }, message);
  }

  async validate(code: string) {
    const promotion = await this.promotionModelAction.get(
      { code, is_active: true },
      {},
      { applicable_courses: true },
    );

    if (!promotion) {
      throw new NotFoundException('Promotion not found or inactive');
    }

    const now = new Date();

    if (promotion.start_date && promotion.start_date > now) {
      throw new BadRequestException('Promotion not yet started');
    }

    if (promotion.end_date && promotion.end_date < now) {
      throw new BadRequestException('Promotion has expired');
    }

    if (promotion.max_uses && promotion.used_count >= promotion.max_uses) {
      throw new BadRequestException(
        'Promotion has reached its maximum usage limit',
      );
    }

    return buildResponse({ promotion }, 'Promotion is valid');
  }
}
