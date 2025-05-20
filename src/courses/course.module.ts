import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@entities/category.entity';
import { Course } from '@entities/course.entity';
import { Module as CourseModules } from '@entities/module.entity';
import { Lesson } from '@entities/lesson.entity';
import { Material } from '@entities/material.entity';
import { Assessment } from '@entities/assessment.entity';
import { Question } from '@entities/question.entity';
import { Option } from '@entities/option.entity';
import { UserCourse } from '@entities/user_course.entity';
import { UserProgress } from '@entities/user_progress.entity';
import { UserAssessment } from '@entities/user_assessment.entity';
import { Review } from '@entities/review.entity';
import { Cart } from '@entities/cart.entity';
import { CartItem } from '@entities/cart_item.entity';
import { PaymentIntent } from '@entities/payment_intent.entity';
import { Certificate } from '@entities/certificate.entity';
import { Promotion } from '@entities/promotion.entity';
import { WishList } from '@entities/wish_list.entity';
import { Notification } from '@entities/notification.entity';
import {
  CategoryModelAction,
  CourseModelAction,
  ModuleModelAction,
  LessonModelAction,
  MaterialModelAction,
  AssessmentModelAction,
  QuestionModelAction,
  OptionModelAction,
  UserCourseModelAction,
  UserProgressModelAction,
  UserAssessmentModelAction,
  ReviewModelAction,
  CartModelAction,
  CartItemModelAction,
  PaymentIntentModelAction,
  CertificateModelAction,
  PromotionModelAction,
  WishListModelAction,
  NotificationModelAction,
} from '../actions/model-actions';
import controllers from './base.controller';
import { services } from './base.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Course,
      Lesson,
      Material,
      Assessment,
      Question,
      Option,
      UserCourse,
      UserProgress,
      UserAssessment,
      Review,
      Cart,
      CartItem,
      PaymentIntent,
      Certificate,
      Promotion,
      WishList,
      Notification,
      CourseModules,
    ]),
  ],
  providers: [
    ...services,
    CategoryModelAction,
    CourseModelAction,
    ModuleModelAction,
    LessonModelAction,
    MaterialModelAction,
    AssessmentModelAction,
    QuestionModelAction,
    OptionModelAction,
    UserCourseModelAction,
    UserProgressModelAction,
    UserAssessmentModelAction,
    ReviewModelAction,
    CartModelAction,
    CartItemModelAction,
    PaymentIntentModelAction,
    CertificateModelAction,
    PromotionModelAction,
    WishListModelAction,
    NotificationModelAction,
  ],
  controllers: [...controllers],
  exports: [],
})
export class CourseModule {}
