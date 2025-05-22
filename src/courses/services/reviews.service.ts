import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Review } from '@entities/review.entity';
import { CourseModelAction, ReviewModelAction } from '@/actions/model-actions';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';
import { CreateReviewDto, UpdateReviewDto } from '@dto/reviews.dto';
import { UserCourseModelAction } from '../../actions/model-actions';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly courseModelAction: CourseModelAction,
    private readonly reviewModelAction: ReviewModelAction,
    private readonly userCourseModelAction: UserCourseModelAction,
  ) {}

  async findAll(listOptions: ListRecordGeneric<Partial<Review>>) {
    const { payload, paginationMeta } = await this.reviewModelAction.list({
      filterRecordOptions: listOptions.filterRecordOptions,
      paginationPayload: listOptions.paginationPayload,
      relations: { course: true },
      order: { created_at: 'DESC' },
    });
    return {
      data: { reviews: payload },
      message: 'Reviews have been retrieved successfully',
      meta: paginationMeta,
    };
  }

  async findOne(id: string) {
    const review = await this.reviewModelAction.get(
      { id },
      {},
      { course: true },
    );
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return buildResponse({ review }, 'Review retrieved successfully');
  }

  async create(
    courseId: string,
    createReviewDto: CreateReviewDto,
    userId: string,
  ) {
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    const userCourse = await this.userCourseModelAction.get({
      user_id: userId,
      course_id: courseId,
    });
    if (!userCourse) {
      throw new BadRequestException(
        'You must be enrolled in the course to leave a review',
      );
    }
    const existingReview = await this.reviewModelAction.get({
      user_id: userId,
      course_id: courseId,
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this course');
    }
    const review = await this.reviewModelAction.create({
      createPayload: {
        ...createReviewDto,
        user_id: userId,
        course_id: courseId,
        is_verified: userCourse.is_completed,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    await this.updateCourseRating(courseId);
    return buildResponse({ review }, 'Review created successfully');
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const review = await this.findOne(id);

    if (review.data.review.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this review',
      );
    }
    const updatedReview = await this.reviewModelAction.update({
      identifierOptions: { id },
      updatePayload: updateReviewDto,
      transactionOptions: {
        useTransaction: false,
      },
    });

    await this.updateCourseRating(review.data.review.course_id);

    return buildResponse(
      { review: updatedReview },
      'Review updated successfully',
    );
  }

  async remove(id: string, userId: string) {
    const review = await this.findOne(id);
    if (review.data.review.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    const courseId = review.data.review.course_id;
    await this.reviewModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    await this.updateCourseRating(courseId);
    return buildResponse(null, 'Review deleted successfully');
  }

  private async updateCourseRating(courseId: string) {
    const reviews = await this.reviewModelAction.find({
      findOptions: { course_id: courseId },
      transactionOptions: {
        useTransaction: false,
      },
    });
    const items = reviews.payload;
    if (items.length === 0) {
      await this.courseModelAction.update({
        identifierOptions: { id: courseId },
        updatePayload: {
          average_rating: 0,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
      return;
    }
    const totalRating = items.reduce(
      (sum, review) => sum + Number(review.rating),
      0,
    );
    const averageRating = totalRating / items.length;
    await this.courseModelAction.update({
      identifierOptions: { id: courseId },
      updatePayload: {
        average_rating: averageRating,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
  }
}
