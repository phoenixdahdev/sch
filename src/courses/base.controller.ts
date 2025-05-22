import { Type } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AssessmentsController } from './controllers/assessments.controller';
import { CartController } from './controllers/cart.controller';
import { CategoriesController } from './controllers/categories.controller';
import { CertificateController } from './controllers/certificate.controller';
import { CoursesController } from './controllers/courses.controller';
import { LessonsController } from './controllers/lessons.controller';
import { MaterialsController } from './controllers/materials.controller';
import { ModulesController } from './controllers/modules.controller';
import { NotificationController } from './controllers/notification.controller';
import { OptionsController } from './controllers/options.controller';
import { PaymentController } from './controllers/payment.controller';
import { PromotionController } from './controllers/promotion.controller';
import { QuestionsController } from './controllers/questions.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { SearchController } from './controllers/search.controller';
import { UploadController } from './controllers/upload.controller';
import { UserAssessmentsController } from './controllers/user-assessments.controller';
import { UserCoursesController } from './controllers/user-courses.controller';
import { WishlistController } from './controllers/wishlist.controller';

const controllers: Type<any>[] = [
  AnalyticsController,
  AssessmentsController,
  CartController,
  CategoriesController,
  CertificateController,
  CoursesController,
  LessonsController,
  MaterialsController,
  ModulesController,
  NotificationController,
  OptionsController,
  PaymentController,
  PromotionController,
  QuestionsController,
  ReviewsController,
  SearchController,
  UploadController,
  UserAssessmentsController,
  UserCoursesController,
  WishlistController,
];

export default controllers;
