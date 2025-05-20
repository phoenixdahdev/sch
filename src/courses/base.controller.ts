import { Type } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { CoursesController } from './controllers/courses.controller';

const controllers: Type<any>[] = [CategoriesController, CoursesController];

export default controllers;
