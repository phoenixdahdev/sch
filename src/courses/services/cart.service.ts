import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CartItemModelAction,
  CartModelAction,
  CourseModelAction,
  UserCourseModelAction,
} from '../../actions/model-actions';
import { buildResponse } from '@kemuko-org/shared-utils';
import { PromotionModelAction } from '../../actions/model-actions';

@Injectable()
export class CartService {
  constructor(
    private readonly cartModelAction: CartModelAction,
    private readonly courseModelAction: CourseModelAction,
    private readonly userCourseModelAction: UserCourseModelAction,
    private readonly cartItemModelAction: CartItemModelAction,
    private readonly promotionModelAction: PromotionModelAction,
  ) { }

  async getCart(userId: string) {
    const cart = await this.cartModelAction.get(
      { user_id: userId },
      {},
      ["items", 'items.course', 'items.course.category'],
    );
    if (!cart) {
      await this.cartModelAction.create({
        createPayload: {
          user_id: userId,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
    }
    return buildResponse(
      {
        cart: await this.cartModelAction.get(
          { user_id: userId },
          {},
          ["items", 'items.course', 'items.course.category'],
        ),
      },
      'Cart retrieved successfully',
    );
  }

  async addToCart(userId: string, courseId: string) {
    const cart = await this.getCart(userId);
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    const isEnrolled = await this.userCourseModelAction.get({
      user_id: userId,
      course_id: courseId,
    });
    if (isEnrolled) {
      throw new BadRequestException('You are already enrolled in this course');
    }
    const existingItem = await this.cartItemModelAction.get({
      cart_id: cart.data.cart.id,
      course_id: courseId,
    });
    if (existingItem) {
      throw new BadRequestException('Course is already in your cart');
    }
    await this.cartItemModelAction.create({
      createPayload: {
        cart_id: cart.data.cart.id,
        course_id: courseId,
        price: course.price,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    await this.updateCartTotal(cart.data.cart.id);
    return this.getCart(userId);
  }

  async removeFromCart(userId: string, courseId: string) {
    const cart = await this.getCart(userId);
    const cartItem = await this.cartItemModelAction.get({
      cart_id: cart.data.cart.id,
      course_id: courseId,
    });
    if (!cartItem) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in your cart`,
      );
    }
    await this.cartItemModelAction.delete({
      identifierOptions: { id: cartItem.id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    await this.updateCartTotal(cart.data.cart.id);

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    await this.cartItemModelAction.delete({
      identifierOptions: { cart_id: cart.data.cart.id },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return this.getCart(userId);
  }

  async checkout(userId: string) {
    const cart = await this.getCart(userId);

    if (cart.data.cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const enrollments = [];

    for (const item of cart.data.cart.items) {
      const userCourse = this.userCourseModelAction.create({
        createPayload: {
          user_id: userId,
          course_id: item.course_id,
          progress_percentage: 0,
          is_completed: false,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
      enrollments.push(userCourse);
      const course = await this.courseModelAction.get({ id: item.course_id });
      await this.courseModelAction.update({
        identifierOptions: { id: item.course_id },
        updatePayload: {
          enrolled_count: course.enrolled_count++,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
    }

    await Promise.all(enrollments);
    await this.clearCart(userId);
    return buildResponse({ enrollments }, 'Checkout successful');
  }

  async applyPromotion(userId: string, code: string) {
    const cart = await this.getCart(userId);
    const promotion = await this.promotionModelAction.get(
      { code, is_active: true },
      {},
      {
        applicable_courses: true,
      },
    );

    if (!promotion) {
      throw new NotFoundException(
        `Promotion code ${code} not found or inactive`,
      );
    }
    const now = new Date();
    if (promotion.start_date && promotion.start_date > now) {
      throw new BadRequestException('This promotion has not started yet');
    }

    if (promotion.end_date && promotion.end_date < now) {
      throw new BadRequestException('This promotion has expired');
    }
    if (promotion.max_uses && promotion.used_count >= promotion.max_uses) {
      throw new BadRequestException(
        'This promotion has reached its maximum number of uses',
      );
    }

    // Apply promotion
    // For specific courses
    if (promotion.applicable_courses.length > 0) {
      const applicableCourseIds = promotion.applicable_courses.map(
        (course) => course.id,
      );

      for (const item of cart.data.cart.items) {
        if (applicableCourseIds.includes(item.course_id)) {
          if (promotion.discount_type === 'percentage') {
            item.price = item.price * (1 - promotion.discount_value / 100);
          } else if (promotion.discount_type === 'fixed') {
            item.price = Math.max(0, item.price - promotion.discount_value);
          }
          await this.cartItemModelAction.update({
            identifierOptions: { id: item.id },
            updatePayload: {
              price: item.price,
            },
            transactionOptions: {
              useTransaction: false,
            },
          });
        }
      }
    } else {
      for (const item of cart.data.cart.items) {
        if (promotion.discount_type === 'percentage') {
          item.price = item.price * (1 - promotion.discount_value / 100);
        } else if (promotion.discount_type === 'fixed') {
          item.price = Math.max(0, item.price - promotion.discount_value);
        }
        await this.cartItemModelAction.update({
          identifierOptions: { id: item.id },
          updatePayload: {
            price: item.price,
          },
          transactionOptions: {
            useTransaction: false,
          },
        });
      }
    }
    await this.updateCartTotal(cart.data.cart.id);
    await this.promotionModelAction.update({
      identifierOptions: { id: promotion.id },
      updatePayload: {
        used_count: promotion.used_count++,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return this.getCart(userId);
  }

  async removePromotion(userId: string) {
    const cart = await this.getCart(userId);
    for (const item of cart.data.cart.items) {
      const course = await this.courseModelAction.get({ id: item.course_id });
      await this.cartItemModelAction.update({
        identifierOptions: { id: item.id },
        updatePayload: {
          price: course.price,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });
    }
    await this.updateCartTotal(cart.data.cart.id);
    return this.getCart(userId);
  }

  private async updateCartTotal(cartId: string) {
    const result = await this.cartItemModelAction.find({
      findOptions: { cart_id: cartId },
      transactionOptions: {
        useTransaction: false,
      },
    });
    const items = result.payload;
    const totalPrice = items.reduce((sum, item) => sum + Number(item.price), 0);
    await this.cartModelAction.update({
      identifierOptions: { id: cartId },
      updatePayload: {
        total_price: totalPrice,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
  }
}
