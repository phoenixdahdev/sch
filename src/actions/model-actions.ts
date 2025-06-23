import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '@kemuko-org/shared-utils';
import {
  Assessment,
  Cart,
  CartItem,
  Category,
  Certificate,
  Course,
  dbNames,
  Lesson,
  MainCategory,
  Material,
  Module,
  Notification,
  Option,
  PaymentIntent,
  Promotion,
  Question,
  Review,
  UserAssessment,
  UserCourse,
  UserProgress,
  WishList,
} from '@kemuko-org/db-schemas';

@Injectable()
export class CategoryModelAction extends AbstractModelAction<Category> {
  constructor(
    @InjectRepository(Category, dbNames.COURSE)
    repository: Repository<Category>,
  ) {
    super(repository, Category);
  }
}

@Injectable()
export class CourseModelAction extends AbstractModelAction<Course> {
  constructor(
    @InjectRepository(Course, dbNames.COURSE)
    repository: Repository<Course>,
  ) {
    super(repository, Course);
  }
}

@Injectable()
export class ModuleModelAction extends AbstractModelAction<Module> {
  constructor(
    @InjectRepository(Module, dbNames.COURSE)
    repository: Repository<Module>,
  ) {
    super(repository, Module);
  }
}

@Injectable()
export class LessonModelAction extends AbstractModelAction<Lesson> {
  constructor(
    @InjectRepository(Lesson, dbNames.COURSE)
    repository: Repository<Lesson>,
  ) {
    super(repository, Lesson);
  }
}

@Injectable()
export class MaterialModelAction extends AbstractModelAction<Material> {
  constructor(
    @InjectRepository(Material, dbNames.COURSE)
    repository: Repository<Material>,
  ) {
    super(repository, Material);
  }
}

@Injectable()
export class AssessmentModelAction extends AbstractModelAction<Assessment> {
  constructor(
    @InjectRepository(Assessment, dbNames.COURSE)
    repository: Repository<Assessment>,
  ) {
    super(repository, Assessment);
  }
}

@Injectable()
export class QuestionModelAction extends AbstractModelAction<Question> {
  constructor(
    @InjectRepository(Question, dbNames.COURSE)
    repository: Repository<Question>,
  ) {
    super(repository, Question);
  }
}

@Injectable()
export class OptionModelAction extends AbstractModelAction<Option> {
  constructor(
    @InjectRepository(Option, dbNames.COURSE)
    repository: Repository<Option>,
  ) {
    super(repository, Option);
  }
}

@Injectable()
export class UserCourseModelAction extends AbstractModelAction<UserCourse> {
  constructor(
    @InjectRepository(UserCourse, dbNames.COURSE)
    repository: Repository<UserCourse>,
  ) {
    super(repository, UserCourse);
  }
}

@Injectable()
export class UserProgressModelAction extends AbstractModelAction<UserProgress> {
  constructor(
    @InjectRepository(UserProgress, dbNames.COURSE)
    repository: Repository<UserProgress>,
  ) {
    super(repository, UserProgress);
  }
}

@Injectable()
export class UserAssessmentModelAction extends AbstractModelAction<UserAssessment> {
  constructor(
    @InjectRepository(UserAssessment, dbNames.COURSE)
    repository: Repository<UserAssessment>,
  ) {
    super(repository, UserAssessment);
  }
}

@Injectable()
export class ReviewModelAction extends AbstractModelAction<Review> {
  constructor(
    @InjectRepository(Review, dbNames.COURSE)
    repository: Repository<Review>,
  ) {
    super(repository, Review);
  }
}

@Injectable()
export class CartModelAction extends AbstractModelAction<Cart> {
  constructor(
    @InjectRepository(Cart, dbNames.COURSE)
    repository: Repository<Cart>,
  ) {
    super(repository, Cart);
  }
}

@Injectable()
export class CartItemModelAction extends AbstractModelAction<CartItem> {
  constructor(
    @InjectRepository(CartItem, dbNames.COURSE)
    repository: Repository<CartItem>,
  ) {
    super(repository, CartItem);
  }
}

@Injectable()
export class PaymentIntentModelAction extends AbstractModelAction<PaymentIntent> {
  constructor(
    @InjectRepository(PaymentIntent, dbNames.COURSE)
    repository: Repository<PaymentIntent>,
  ) {
    super(repository, PaymentIntent);
  }
}

@Injectable()
export class CertificateModelAction extends AbstractModelAction<Certificate> {
  constructor(
    @InjectRepository(Certificate, dbNames.COURSE)
    repository: Repository<Certificate>,
  ) {
    super(repository, Certificate);
  }
}

@Injectable()
export class PromotionModelAction extends AbstractModelAction<Promotion> {
  constructor(
    @InjectRepository(Promotion, dbNames.COURSE)
    repository: Repository<Promotion>,
  ) {
    super(repository, Promotion);
  }
}

@Injectable()
export class WishListModelAction extends AbstractModelAction<WishList> {
  constructor(
    @InjectRepository(WishList, dbNames.COURSE)
    repository: Repository<WishList>,
  ) {
    super(repository, WishList);
  }
}

@Injectable()
export class NotificationModelAction extends AbstractModelAction<Notification> {
  constructor(
    @InjectRepository(Notification, dbNames.COURSE)
    repository: Repository<Notification>,
  ) {
    super(repository, Notification);
  }
}

@Injectable()
export class MainCategoryModelAction extends AbstractModelAction<MainCategory> {
  constructor(
    @InjectRepository(MainCategory, dbNames.COURSE)
    repository: Repository<MainCategory>,
  ) {
    super(repository, MainCategory);
  }
}
