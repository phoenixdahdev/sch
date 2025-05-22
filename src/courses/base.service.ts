import { Provider } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AssessmentsService } from './services/assessments.service';
import { CartService } from './services/cart.service';
import { CategoriesService } from './services/categories.service';
import { CertificateService } from './services/certificate.service';
import { CoursesService } from './services/course.service';
import { LessonsService } from './services/lessons.service';
import { MaterialsService } from './services/materials.service';
import { ModulesService } from './services/modules.service';
import { NotificationService } from './services/notification.service';
import { OptionsService } from './services/options.service';
import { PaymentService } from './services/payment.service';
import { PromotionService } from './services/promotion.service';
import { QuestionsService } from './services/questions.service';
import { ReviewsService } from './services/reviews.service';
import { SearchService } from './services/search.service';
import { UploadService } from './services/upload.service';
import { UserAssessmentsService } from './services/user-assessments.service';
import { UserCoursesService } from './services/user-courses.service';
import { WishlistService } from './services/wishlist.service';

export const services: Provider[] = [
  AnalyticsService,
  AssessmentsService,
  CartService,
  CategoriesService,
  CertificateService,
  CoursesService,
  LessonsService,
  MaterialsService,
  ModulesService,
  NotificationService,
  OptionsService,
  PaymentService,
  PromotionService,
  QuestionsService,
  ReviewsService,
  SearchService,
  UploadService,
  UserAssessmentsService,
  UserCoursesService,
  WishlistService,
];
