import { Provider } from '@nestjs/common';
import { CoursesService } from './services/course.service';
import { CategoriesService } from './services/categories.service';
import { ModulesService } from './services/modules.service';

export const services: Provider[] = [
  CoursesService,
  CategoriesService,
  ModulesService,
];
