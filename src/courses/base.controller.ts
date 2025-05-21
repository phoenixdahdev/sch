import { Type } from '@nestjs/common';
import { CoursesController } from './controllers/courses.controller';
import { ModulesController } from './controllers/modules.controller';
import { LessonsController } from './controllers/lessons.controller';
import { CategoriesController } from './controllers/categories.controller';

const controllers: Type<any>[] = [
  CategoriesController,
  CoursesController,
  ModulesController,
  LessonsController,
];

export default controllers;
