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
];

export default controllers;
