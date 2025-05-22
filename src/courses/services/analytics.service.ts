import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '@entities/course.entity';
import { UserCourse } from '@entities/user_course.entity';
import { UserProgress } from '@entities/user_progress.entity';
import { Review } from '@entities/review.entity';
import { PaymentIntent } from '@entities/payment_intent.entity';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserCourse)
    private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(PaymentIntent)
    private paymentIntentRepository: Repository<PaymentIntent>,
  ) {}

  async getCreatorCourseAnalytics(userId: string, period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);
    const courses = await this.courseRepository.find({
      where: { creator_id: userId },
    });
    const courseIds = courses.map((course) => course.id);
    const enrollments = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .where('user_course.course_id IN (:...courseIds)', { courseIds })
      .andWhere('user_course.enrolled_at >= :startDate', { startDate })
      .select('user_course.course_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user_course.course_id')
      .getRawMany();

    const completions = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .where('user_course.course_id IN (:...courseIds)', { courseIds })
      .andWhere('user_course.is_completed = :isCompleted', {
        isCompleted: true,
      })
      .andWhere('user_course.completed_at >= :startDate', { startDate })
      .select('user_course.course_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user_course.course_id')
      .getRawMany();

    const revenue = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .innerJoin('cart', 'cart', 'payment.cart_id = cart.id')
      .innerJoin('cart_item', 'cart_item', 'cart_item.cart_id = cart.id')
      .where('cart_item.course_id IN (:...courseIds)', { courseIds })
      .andWhere('payment.status = :status', { status: 'succeeded' })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .select('cart_item.course_id')
      .addSelect('SUM(cart_item.price)', 'revenue')
      .groupBy('cart_item.course_id')
      .getRawMany();

    return buildResponse(
      {
        courses: courses.map((course) => ({
          id: course.id,
          title: course.title,
          enrollments:
            enrollments.find((e) => e.course_id === course.id)?.count || 0,
          completions:
            completions.find((c) => c.course_id === course.id)?.count || 0,
          revenue: revenue.find((r) => r.course_id === course.id)?.revenue || 0,
        })),
        total: {
          courses: courses.length,
          enrollments: enrollments.reduce(
            (sum: number, e) => sum + Number(e.count),
            0,
          ),
          completions: completions.reduce(
            (sum: number, c) => sum + Number(c.count),
            0,
          ),
          revenue: revenue.reduce(
            (sum: number, r) => sum + Number(r.revenue),
            0,
          ),
        },
      },
      'Analytics retrieved successfully',
    );
  }

  async getCreatorCourseDetailAnalytics(
    userId: string,
    courseId: string,
    period: string = '30d',
  ) {
    const startDate = this.getStartDateFromPeriod(period);

    const course = await this.courseRepository.findOne({
      where: { id: courseId, creator_id: userId },
    });

    if (!course) {
      return { error: 'Course not found or not owned by this user' };
    }

    const enrollmentsByDay = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .where('user_course.course_id = :courseId', { courseId })
      .andWhere('user_course.enrolled_at >= :startDate', { startDate })
      .select("DATE_TRUNC('day', user_course.enrolled_at)", 'day')
      .addSelect('COUNT(*)', 'count')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    const totalEnrollments = await this.userCourseRepository.count({
      where: { course_id: courseId },
    });

    const completedEnrollments = await this.userCourseRepository.count({
      where: { course_id: courseId, is_completed: true },
    });

    const completionRate =
      totalEnrollments > 0
        ? (completedEnrollments / totalEnrollments) * 100
        : 0;

    const reviews = await this.reviewRepository.find({
      where: { course_id: courseId },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        : 0;

    const revenue = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .innerJoin('cart', 'cart', 'payment.cart_id = cart.id')
      .innerJoin('cart_item', 'cart_item', 'cart_item.cart_id = cart.id')
      .where('cart_item.course_id = :courseId', { courseId })
      .andWhere('payment.status = :status', { status: 'succeeded' })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .select('SUM(cart_item.price)', 'total')
      .getRawOne();

    return buildResponse(
      {
        course: {
          id: course.id,
          title: course.title,
          enrollments: totalEnrollments,
          completions: completedEnrollments,
          completionRate,
          averageRating,
          revenue: revenue?.total || 0,
        },
        enrollmentsByDay,
      },
      'Analytics retrieved successfully',
    );
  }

  async getCreatorRevenueAnalytics(userId: string, period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);

    const courses = await this.courseRepository.find({
      where: { creator_id: userId },
    });

    const courseIds = courses.map((course) => course.id);
    const revenueByDay = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .innerJoin('cart', 'cart', 'payment.cart_id = cart.id')
      .innerJoin('cart_item', 'cart_item', 'cart_item.cart_id = cart.id')
      .where('cart_item.course_id IN (:...courseIds)', { courseIds })
      .andWhere('payment.status = :status', { status: 'succeeded' })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .select("DATE_TRUNC('day', payment.created_at)", 'day')
      .addSelect('SUM(cart_item.price)', 'revenue')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    const revenueByCourse = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .innerJoin('cart', 'cart', 'payment.cart_id = cart.id')
      .innerJoin('cart_item', 'cart_item', 'cart_item.cart_id = cart.id')
      .innerJoin('course', 'course', 'cart_item.course_id = course.id')
      .where('cart_item.course_id IN (:...courseIds)', { courseIds })
      .andWhere('payment.status = :status', { status: 'succeeded' })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .select('course.id', 'course_id')
      .addSelect('course.title', 'course_title')
      .addSelect('SUM(cart_item.price)', 'revenue')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .orderBy('revenue', 'DESC')
      .getRawMany();

    const totalRevenue = revenueByCourse.reduce(
      (sum: number, item: { revenue: string | number }) =>
        sum + Number(item.revenue),
      0,
    );

    return buildResponse(
      {
        totalRevenue,
        revenueByDay,
        revenueByCourse,
      },
      'Analytics retrieved successfully',
    );
  }

  async getCreatorStudentAnalytics(userId: string, period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);
    const courses = await this.courseRepository.find({
      where: { creator_id: userId },
    });
    const courseIds = courses.map((course) => course.id);
    const newStudentsByDay = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .where('user_course.course_id IN (:...courseIds)', { courseIds })
      .andWhere('user_course.enrolled_at >= :startDate', { startDate })
      .select("DATE_TRUNC('day', user_course.enrolled_at)", 'day')
      .addSelect('COUNT(DISTINCT user_course.user_id)', 'count')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    const totalStudents = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .where('user_course.course_id IN (:...courseIds)', { courseIds })
      .select('COUNT(DISTINCT user_course.user_id)', 'count')
      .getRawOne();

    const studentsByCourse = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .innerJoin('course', 'course', 'user_course.course_id = course.id')
      .where('user_course.course_id IN (:...courseIds)', { courseIds })
      .select('course.id', 'course_id')
      .addSelect('course.title', 'course_title')
      .addSelect('COUNT(DISTINCT user_course.user_id)', 'count')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .orderBy('count', 'DESC')
      .getRawMany();

    return buildResponse(
      {
        totalStudents: totalStudents?.count || 0,
        newStudentsByDay,
        studentsByCourse,
      },
      'Analytics retrieved successfully',
    );
  }

  async getStudentLearningAnalytics(userId: string, period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);
    const enrolledCourses = await this.userCourseRepository.find({
      where: { user_id: userId },
      relations: ['course'],
    });
    const learningTimeByDay: { day: string; seconds: number }[] =
      await this.userProgressRepository
        .createQueryBuilder('progress')
        .innerJoin(
          'user_course',
          'user_course',
          'progress.user_course_id = user_course.id',
        )
        .where('user_course.user_id = :userId', { userId })
        .andWhere('progress.updated_at >= :startDate', { startDate })
        .select("DATE_TRUNC('day', progress.updated_at)", 'day')
        .addSelect('SUM(progress.watch_time_in_seconds)', 'seconds')
        .groupBy('day')
        .orderBy('day', 'ASC')
        .getRawMany();

    const completedLessons = await this.userProgressRepository
      .createQueryBuilder('progress')
      .innerJoin(
        'user_course',
        'user_course',
        'progress.user_course_id = user_course.id',
      )
      .where('user_course.user_id = :userId', { userId })
      .andWhere('progress.is_completed = :isCompleted', { isCompleted: true })
      .andWhere('progress.completed_at >= :startDate', { startDate })
      .select('COUNT(*)', 'count')
      .getRawOne();

    const courseProgress = await Promise.all(
      enrolledCourses.map(async (userCourse) => {
        const lessons = await this.userProgressRepository.count({
          where: { user_course_id: userCourse.id, is_completed: true },
        });

        return {
          course_id: userCourse.course_id,
          course_title: userCourse.course.title,
          progress_percentage: userCourse.progress_percentage,
          completed_lessons: lessons,
          enrolled_at: userCourse.enrolled_at,
          is_completed: userCourse.is_completed,
          completed_at: userCourse.completed_at,
        };
      }),
    );

    return buildResponse(
      {
        totalCourses: enrolledCourses.length,
        completedCourses: enrolledCourses.filter((c) => c.is_completed).length,
        totalLearningTime: learningTimeByDay.reduce(
          (sum, day: { seconds: number }) => sum + Number(day.seconds),
          0,
        ),
        completedLessons: completedLessons?.count || 0,
        learningTimeByDay,
        courseProgress,
      },
      'Analytics retrieved successfully',
    );
  }

  async getStudentPerformanceAnalytics(userId: string, period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);
    const assessmentResults = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .innerJoin(
        'user_assessment',
        'assessment',
        'assessment.user_course_id = user_course.id',
      )
      .innerJoin('course', 'course', 'user_course.course_id = course.id')
      .where('user_course.user_id = :userId', { userId })
      .andWhere('assessment.completed_at >= :startDate', { startDate })
      .select('course.id', 'course_id')
      .addSelect('course.title', 'course_title')
      .addSelect('assessment.assessment_id', 'assessment_id')
      .addSelect('assessment.score', 'score')
      .addSelect('assessment.is_passed', 'is_passed')
      .addSelect('assessment.completed_at', 'completed_at')
      .orderBy('assessment.completed_at', 'DESC')
      .getRawMany();
    const averageScoresByCourse = [];
    const courseMap = new Map();

    for (const result of assessmentResults) {
      if (!courseMap.has(result.course_id)) {
        courseMap.set(result.course_id, {
          course_id: result.course_id,
          course_title: result.course_title,
          total_score: 0,
          count: 0,
        });
      }

      const courseData = courseMap.get(result.course_id);
      courseData.total_score += Number(result.score);
      courseData.count += 1;
    }

    for (const [, data] of courseMap) {
      averageScoresByCourse.push({
        course_id: data.course_id,
        course_title: data.course_title,
        average_score: data.count > 0 ? data.total_score / data.count : 0,
      });
    }
    const passRate =
      assessmentResults.length > 0
        ? (assessmentResults.filter((r) => r.is_passed).length /
            assessmentResults.length) *
          100
        : 0;

    return buildResponse(
      {
        assessmentResults,
        averageScoresByCourse,
        passRate,
        totalAssessments: assessmentResults.length,
        passedAssessments: assessmentResults.filter((r) => r.is_passed).length,
      },
      'Analytics retrieved successfully',
    );
  }

  async getAdminPlatformAnalytics(period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);
    const totalUsers = 0;

    // Get new users by day
    const newUsersByDay = []; //TODO: This would come from your user service
    const totalCourses = await this.courseRepository.count();
    const newCoursesByDay = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.created_at >= :startDate', { startDate })
      .select("DATE_TRUNC('day', course.created_at)", 'day')
      .addSelect('COUNT(*)', 'count')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    const totalEnrollments = await this.userCourseRepository.count();
    const newEnrollmentsByDay = await this.userCourseRepository
      .createQueryBuilder('user_course')
      .where('user_course.enrolled_at >= :startDate', { startDate })
      .select("DATE_TRUNC('day', user_course.enrolled_at)", 'day')
      .addSelect('COUNT(*)', 'count')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    return buildResponse(
      {
        totalUsers,
        totalCourses,
        totalEnrollments,
        newUsersByDay,
        newCoursesByDay,
        newEnrollmentsByDay,
      },
      'Analytics retrieved successfully',
    );
  }

  async getAdminRevenueAnalytics(period: string = '30d') {
    const startDate = this.getStartDateFromPeriod(period);
    const totalRevenue = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: 'succeeded' })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    const revenueByDay = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: 'succeeded' })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .select("DATE_TRUNC('day', payment.created_at)", 'day')
      .addSelect('SUM(payment.amount)', 'revenue')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    const topSellingCourses = await this.paymentIntentRepository
      .createQueryBuilder('payment')
      .innerJoin('cart', 'cart', 'payment.cart_id = cart.id')
      .innerJoin('cart_item', 'cart_item', 'cart_item.cart_id = cart.id')
      .innerJoin('course', 'course', 'cart_item.course_id = course.id')
      .where('payment.status = :status', { status: 'succeeded' })
      .andWhere('payment.created_at >= :startDate', { startDate })
      .select('course.id', 'course_id')
      .addSelect('course.title', 'course_title')
      .addSelect('COUNT(*)', 'sales')
      .addSelect('SUM(cart_item.price)', 'revenue')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .orderBy('sales', 'DESC')
      .limit(10)
      .getRawMany();

    return buildResponse(
      {
        totalRevenue: totalRevenue?.total || 0,
        revenueByDay,
        topSellingCourses,
      },
      'Analytics retrieved successfully',
    );
  }

  getAdminUserAnalytics() {
    // TODO: This would require integration with your user service
    return buildResponse(null, 'User analytics not implemented');
  }

  async getAdminCourseAnalytics() {
    // const { period = '30d' } = query;
    // // const startDate = this.getStartDateFromPeriod(period);

    const coursesByCategory = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin('category', 'category', 'course.category_id = category.id')
      .select('category.id', 'category_id')
      .addSelect('category.name', 'category_name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    const coursesByLevel = await this.courseRepository
      .createQueryBuilder('course')
      .select('course.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('course.level')
      .orderBy('count', 'DESC')
      .getRawMany();

    const mostPopularCourses = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin('category', 'category', 'course.category_id = category.id')
      .select('course.id', 'course_id')
      .addSelect('course.title', 'course_title')
      .addSelect('category.name', 'category_name')
      .addSelect('course.enrolled_count', 'enrolled_count')
      .addSelect('course.average_rating', 'average_rating')
      .orderBy('course.enrolled_count', 'DESC')
      .limit(10)
      .getRawMany();

    const highestRatedCourses = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin('category', 'category', 'course.category_id = category.id')
      .where('course.average_rating > 0')
      .select('course.id', 'course_id')
      .addSelect('course.title', 'course_title')
      .addSelect('category.name', 'category_name')
      .addSelect('course.enrolled_count', 'enrolled_count')
      .addSelect('course.average_rating', 'average_rating')
      .orderBy('course.average_rating', 'DESC')
      .limit(10)
      .getRawMany();

    return buildResponse(
      {
        coursesByCategory,
        coursesByLevel,
        mostPopularCourses,
        highestRatedCourses,
      },
      'Analytics retrieved successfully',
    );
  }

  private getStartDateFromPeriod(period: string): Date {
    const now = new Date();
    const days = parseInt(period.replace(/[^0-9]/g, ''), 10) || 30;
    now.setDate(now.getDate() - days);
    return now;
  }
}
