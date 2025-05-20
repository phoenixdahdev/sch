import { Type } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { CoursesController } from './controllers/courses.controller';
import { ModulesController } from './controllers/modules.controller';

const controllers: Type<any>[] = [
  CategoriesController,
  CoursesController,
  ModulesController,
];

export default controllers;
