import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '@kemuko-org/shared-utils';
import { Category } from '@entities/category.entity';
import { Course } from '@entities/course.entity';
import { Option } from '@entities/option.entity';
import { Module } from '@entities/module.entity';
import { Lesson } from '@entities/lesson.entity';
import { Material } from '@entities/material.entity';
import { Assessment } from '@entities/assessment.entity';
import { Question } from '@entities/question.entity';
import { UserCourse } from '@entities/user_course.entity';
import { UserProgress } from '@entities/user_progress.entity';
import { UserAssessment } from '@entities/user_assessment.entity';
import { Review } from '@entities/review.entity';
import { Cart } from '@entities/cart.entity';
import { CartItem } from '@entities/cart_item.entity';
import { PaymentIntent } from '@entities/payment_intent.entity';
import { Certificate } from '@entities/certificate.entity';
import { Promotion } from '@entities/promotion.entity';
import { WishList } from '@entities/wish_list.entity';
import { Notification } from '@entities/notification.entity';

@Injectable()
export class CategoryModelAction extends AbstractModelAction<Category> {
  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    super(repository, Category);
  }
}

@Injectable()
export class CourseModelAction extends AbstractModelAction<Course> {
  constructor(
    @InjectRepository(Course)
    repository: Repository<Course>,
  ) {
    super(repository, Course);
  }
}

@Injectable()
export class ModuleModelAction extends AbstractModelAction<Module> {
  constructor(
    @InjectRepository(Module)
    repository: Repository<Module>,
  ) {
    super(repository, Module);
  }
}

@Injectable()
export class LessonModelAction extends AbstractModelAction<Lesson> {
  constructor(
    @InjectRepository(Lesson)
    repository: Repository<Lesson>,
  ) {
    super(repository, Lesson);
  }
}

@Injectable()
export class MaterialModelAction extends AbstractModelAction<Material> {
  constructor(
    @InjectRepository(Material)
    repository: Repository<Material>,
  ) {
    super(repository, Material);
  }
}

@Injectable()
export class AssessmentModelAction extends AbstractModelAction<Assessment> {
  constructor(
    @InjectRepository(Assessment)
    repository: Repository<Assessment>,
  ) {
    super(repository, Assessment);
  }
}

@Injectable()
export class QuestionModelAction extends AbstractModelAction<Question> {
  constructor(
    @InjectRepository(Question)
    repository: Repository<Question>,
  ) {
    super(repository, Question);
  }
}

@Injectable()
export class OptionModelAction extends AbstractModelAction<Option> {
  constructor(
    @InjectRepository(Option)
    repository: Repository<Option>,
  ) {
    super(repository, Option);
  }
}

@Injectable()
export class UserCourseModelAction extends AbstractModelAction<UserCourse> {
  constructor(
    @InjectRepository(UserCourse)
    repository: Repository<UserCourse>,
  ) {
    super(repository, UserCourse);
  }
}

@Injectable()
export class UserProgressModelAction extends AbstractModelAction<UserProgress> {
  constructor(
    @InjectRepository(UserProgress)
    repository: Repository<UserProgress>,
  ) {
    super(repository, UserProgress);
  }
}

@Injectable()
export class UserAssessmentModelAction extends AbstractModelAction<UserAssessment> {
  constructor(
    @InjectRepository(UserAssessment)
    repository: Repository<UserAssessment>,
  ) {
    super(repository, UserAssessment);
  }
}

@Injectable()
export class ReviewModelAction extends AbstractModelAction<Review> {
  constructor(
    @InjectRepository(Review)
    repository: Repository<Review>,
  ) {
    super(repository, Review);
  }
}

@Injectable()
export class CartModelAction extends AbstractModelAction<Cart> {
  constructor(
    @InjectRepository(Cart)
    repository: Repository<Cart>,
  ) {
    super(repository, Cart);
  }
}

@Injectable()
export class CartItemModelAction extends AbstractModelAction<CartItem> {
  constructor(
    @InjectRepository(CartItem)
    repository: Repository<CartItem>,
  ) {
    super(repository, CartItem);
  }
}

@Injectable()
export class PaymentIntentModelAction extends AbstractModelAction<PaymentIntent> {
  constructor(
    @InjectRepository(PaymentIntent)
    repository: Repository<PaymentIntent>,
  ) {
    super(repository, PaymentIntent);
  }
}

@Injectable()
export class CertificateModelAction extends AbstractModelAction<Certificate> {
  constructor(
    @InjectRepository(Certificate)
    repository: Repository<Certificate>,
  ) {
    super(repository, Certificate);
  }
}

@Injectable()
export class PromotionModelAction extends AbstractModelAction<Promotion> {
  constructor(
    @InjectRepository(Promotion)
    repository: Repository<Promotion>,
  ) {
    super(repository, Promotion);
  }
}

@Injectable()
export class WishListModelAction extends AbstractModelAction<WishList> {
  constructor(
    @InjectRepository(WishList)
    repository: Repository<WishList>,
  ) {
    super(repository, WishList);
  }
}

@Injectable()
export class NotificationModelAction extends AbstractModelAction<Notification> {
  constructor(
    @InjectRepository(Notification)
    repository: Repository<Notification>,
  ) {
    super(repository, Notification);
  }
}
