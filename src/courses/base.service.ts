import { Provider } from '@nestjs/common';
import { CoursesService } from './services/course.service';
import { CategoriesService } from './services/categories.service';
import { ModulesService } from './services/modules.service';
import { LessonsService } from './services/lessons.service';
import { CartService } from './services/cart.service';
import { UserCoursesService } from './services/user-courses.service';
import { ReviewsService } from './services/reviews.service';
import { CertificateService } from './services/certificate.service';
import { WishlistService } from './services/wishlist.service';
import { PaymentService } from './services/payment.service';
import { NotificationService } from './services/notification.service';

export const services: Provider[] = [
  CoursesService,
  CategoriesService,
  ModulesService,
  LessonsService,
  CartService,
  UserCoursesService,
  ReviewsService,
  PaymentService,
  CertificateService,
  WishlistService,
  NotificationService,
];
