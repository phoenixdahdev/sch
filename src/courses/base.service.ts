import { Provider } from '@nestjs/common';
import { CoursesService } from './services/course.service';
import { CategoriesService } from './services/categories.service';
import { ModulesService } from './services/modules.service';
import { LessonsService } from './services/lessons.service';
import { CartService } from './services/cart.service';
import { UserCoursesService } from './services/user-courses.service';
import { ReviewsService } from './services/reviews.service';
import { PaymentIntent } from '@entities/payment_intent.entity';
import { CertificateService } from './services/certificate.service';

export const services: Provider[] = [
  CoursesService,
  CategoriesService,
  ModulesService,
  LessonsService,
  CartService,
  UserCoursesService,
  ReviewsService,
  PaymentIntent,
  CertificateService,
];
