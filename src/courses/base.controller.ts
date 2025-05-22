import { Type } from '@nestjs/common';
import { CoursesController } from './controllers/courses.controller';
import { ModulesController } from './controllers/modules.controller';
import { LessonsController } from './controllers/lessons.controller';
import { CategoriesController } from './controllers/categories.controller';
import { CartController } from './controllers/cart.controller';
import { UserCoursesController } from './controllers/user-courses.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { PaymentController } from './controllers/payment.controller';
import { CertificateController } from './controllers/certificate.controller';
import { WishlistController } from './controllers/wishlist.controller';
import { NotificationController } from './controllers/notification.controller';
import { SearchController } from './controllers/search.controller';
import { UploadController } from './controllers/upload.controller';
import { AnalyticsController } from './controllers/analytics.controller';

const controllers: Type<any>[] = [
  CategoriesController,
  CoursesController,
  ModulesController,
  LessonsController,
  CartController,
  UserCoursesController,
  ReviewsController,
  PaymentController,
  CertificateController,
  WishlistController,
  NotificationController,
  SearchController,
  UploadController,
  AnalyticsController
];

export default controllers;
