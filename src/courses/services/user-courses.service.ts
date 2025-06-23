import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCourse } from '@entities/user_course.entity';
import { Lesson } from '@entities/lesson.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  CourseModelAction,
  UserCourseModelAction,
  CertificateModelAction,
} from '../../actions/model-actions';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';
import { buildResponse, User } from '@kemuko-org/shared-utils';
import { UserProgress } from '@entities/user_progress.entity';

@Injectable()
export class UserCoursesService {
  constructor(
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    private readonly userCourseModelAction: UserCourseModelAction,
    private readonly courseModelAction: CourseModelAction,
    private readonly certificateModelAction: CertificateModelAction,
  ) {}

  async findAll(listOption: ListRecordGeneric<Partial<UserCourse>>) {
    const { payload, paginationMeta } = await this.userCourseModelAction.list({
      filterRecordOptions: listOption.filterRecordOptions,
      paginationPayload: listOption.paginationPayload,
      relations: ['course', 'course.category'],
    });

    return {
      data: { courses: payload },
      meta: paginationMeta,
      message: 'User course retrived',
    };
  }

  async findOne(userId: string, courseId: string) {
    const userCourse = await this.userCourseModelAction.get(
      { user_id: userId, course_id: courseId },
      {},
      ['course', 'course.category'],
    );

    if (!userCourse) {
      throw new NotFoundException(
        `You are not enrolled in course with ID ${courseId}`,
      );
    }
    return buildResponse(
      { course: userCourse },
      'Courses have been retrived successfully',
    );
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const existingEnrollment = await this.userCourseModelAction.get({
      user_id: userId,
      course_id: courseId,
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    const userCourse = await this.userCourseModelAction.create({
      createPayload: {
        user_id: userId,
        course_id: courseId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    await this.courseModelAction.update({
      identifierOptions: { id: courseId },
      updatePayload: {
        enrolled_count: course.enrolled_count++,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ course: userCourse }, 'Enrolled Sucessfully');
  }

  async remove(userId: string, courseId: string) {
    const userCourse = await this.findOne(userId, courseId);
    await this.userCourseModelAction.delete({
      identifierOptions: { id: userCourse.data.course.id },
      transactionOptions: {
        useTransaction: false,
      },
    });

    const course = await this.courseModelAction.get({ id: courseId });
    if (course) {
      await this.courseModelAction.update({
        identifierOptions: { id: courseId },
        updatePayload: {
          enrolled_count: course.enrolled_count--,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
    }
    return buildResponse(null, 'Course removed successfully');
  }

  async getProgress(userId: string, courseId: string) {
    const userCourse = await this.userCourseModelAction.get({
      user_id: userId,
      course_id: courseId,
    });

    if (!userCourse) {
      throw new NotFoundException(
        `You are not enrolled in course with ID ${courseId}`,
      );
    }

    const lessons = await this.lessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.module', 'module')
      .where('module.course_id = :courseId', { courseId })
      .getMany();

    const totalLessons = lessons.length;

    if (totalLessons === 0) {
      return { progress: 0, completedLessons: 0, totalLessons: 0 };
    }
    const completedLessons = await this.userProgressRepository.count({
      where: {
        user_course_id: userCourse.id,
        is_completed: true,
      },
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);
    userCourse.progress_percentage = progress;
    if (progress === 100 && !userCourse.is_completed) {
      userCourse.is_completed = true;
      userCourse.completed_at = new Date();
    }

    await this.userCourseModelAction.update({
      identifierOptions: { id: userCourse.id },
      updatePayload: {
        progress_percentage: userCourse.progress_percentage,
        is_completed: userCourse.is_completed,
        completed_at: userCourse.completed_at,
      },
      transactionOptions: { useTransaction: false },
    });
    return buildResponse(
      { progress, completedLessons, totalLessons },
      'User course progress retrived successfully',
    );
  }

  async generateCertificate(user: User, courseId: string) {
    const userCourse = await this.userCourseModelAction.get({
      user_id: user.id,
      course_id: courseId,
    });
    if (!userCourse) {
      throw new NotFoundException('User is not enrolled in this course');
    }

    if (!userCourse.is_completed) {
      throw new BadRequestException(
        'You need to complete the course before generating a certificate',
      );
    }

    let certificate = await this.certificateModelAction.get({
      user_course_id: userCourse.id,
    });

    if (certificate) {
      return buildResponse({ certificate }, 'Certificate already generated');
    }

    const course = await this.courseModelAction.get({ id: courseId });

    if (!course) {
      throw new NotFoundException('Course not found');
    }
    certificate = await this.certificateModelAction.create({
      createPayload: {
        user_course_id: userCourse.id,
        user_id: user.id,
        course_id: courseId,
        course_name: course.title,
        user_name: user.name,
        verification_code: uuidv4(),
        certificate_url: '',
      },
      transactionOptions: { useTransaction: false },
    });

    return buildResponse({ certificate }, 'Certificate generated successfully');
  }
}
