import {
  CourseModelAction,
  ReviewModelAction,
} from '../../actions/model-actions';
import { CreateCourseDto, UpdateCourseDto } from '@dto/courses.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';
import { buildResponse } from '@kemuko-org/shared-utils';
import { ILike } from 'typeorm';
import { Course, Review } from '@kemuko-org/db-schemas';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseModelAction: CourseModelAction,
    private readonly reviewModelAction: ReviewModelAction,
  ) {}

  async findAll(listOptions: ListRecordGeneric<Partial<Course>>) {
    const { payload, paginationMeta } = await this.courseModelAction.list({
      filterRecordOptions: {
        ...listOptions.filterRecordOptions,
        is_published: true,
      },
      paginationPayload: listOptions.paginationPayload,
      relations: { category: true },
    });

    return {
      data: { courses: payload },
      message: 'Courses have been retrieved successfully',
      meta: paginationMeta,
    };
  }

  async findOne(id: string) {
    const course = await this.courseModelAction.get(
      { id },
      {},
      { category: true },
    );
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return buildResponse({ course }, 'Course retrived successfully');
  }
  async create(createCourseDto: CreateCourseDto, userId: string) {
    const course = await this.courseModelAction.create({
      createPayload: {
        ...createCourseDto,
        creator_id: userId,
        is_published: false,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return buildResponse({ course }, 'Course created successfully');
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);
    const updatedCourse = await this.courseModelAction.update({
      identifierOptions: { id },
      updatePayload: updateCourseDto,
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(
      { updatedCourse: updatedCourse },
      'Course updated successfully',
    );
  }
  async remove(id: string) {
    await this.findOne(id);
    await this.courseModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return { message: 'Course deleted successfully' };
  }
  async getCourseReviews(listOptions: ListRecordGeneric<Partial<Review>>) {
    const { payload, paginationMeta } = await this.reviewModelAction.list({
      filterRecordOptions: { ...listOptions.filterRecordOptions },
      paginationPayload: listOptions.paginationPayload,
    });
    return {
      data: { reviews: payload },
      meta: paginationMeta,
      message: 'Reviews retrived',
    };
  }

  async searchCourses(
    searchTerm: string,
    options: ListRecordGeneric<Partial<Course>>,
  ) {
    const { filterRecordOptions, paginationPayload, order } = options;
    const searchConditions = [
      { ...filterRecordOptions, title: ILike(`%${searchTerm}%`) },
      { ...filterRecordOptions, description: ILike(`%${searchTerm}%`) },
      { ...filterRecordOptions, about: ILike(`%${searchTerm}%`) },
    ];

    const { payload, paginationMeta } = await this.courseModelAction.list({
      filterRecordOptions: {
        ...searchConditions,
        is_published: true,
      },
      paginationPayload,
      order,
      relations: { category: true },
    });
    return {
      data: { courses: payload },
      message: 'Courses have been retrived successfully',
      meta: paginationMeta,
    };
  }
}
