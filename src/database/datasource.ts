import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Course } from '../entities/course.entity';
import { Module } from '../entities/module.entity';
import { Lesson } from '../entities/lesson.entity';
import { Material } from '../entities/material.entity';
import { Assessment } from '../entities/assessment.entity';
import { Question } from '../entities/question.entity';
import { Option } from '../entities/option.entity';
import { UserCourse } from '../entities/user_course.entity';
import { UserProgress } from '../entities/user_progress.entity';
import { UserAssessment } from '../entities/user_assessment.entity';
import { Review } from '../entities/review.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart_item.entity';
import { PaymentIntent } from '../entities/payment_intent.entity';
import { Certificate } from '../entities/certificate.entity';
import { Promotion } from '../entities/promotion.entity';
import { WishList } from '../entities/wish_list.entity';
import { Notification } from '../entities/notification.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isDevelopment = process.env.NODE_ENV === 'development';
config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });
const dataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  entities: [
    Category,
    Course,
    Lesson,
    Material,
    Assessment,
    Question,
    Option,
    UserCourse,
    UserProgress,
    UserAssessment,
    Review,
    Cart,
    CartItem,
    PaymentIntent,
    Certificate,
    Promotion,
    WishList,
    Notification,
    Module,
  ],
  migrations: ['src/migrations/**/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  migrationsTableName: 'migrations',
  logging: ['schema', 'migration', 'error'],
  ssl: !isDevelopment,
  ...(!isDevelopment
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
});

export default dataSource;
