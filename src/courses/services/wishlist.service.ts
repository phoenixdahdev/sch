import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  CourseModelAction,
  WishListModelAction,
  CartModelAction,
} from '../../actions/model-actions';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class WishlistService {
  constructor(
    private cartService: CartService,
    private readonly wishListModelAction: WishListModelAction,
    private readonly courseModelAction: CourseModelAction,
    private readonly cartModelAction: CartModelAction,
  ) { }

  async getWishlist(userId: string) {
    const wishlist = await this.wishListModelAction.get(
      { user_id: userId },
      {},
      ["course", 'course.category'],
    );
    if (!wishlist) {
      await this.wishListModelAction.create({
        createPayload: { user_id: userId },
        transactionOptions: { useTransaction: false },
      });
    }
    return buildResponse({ wishlist }, 'Wishlist retrieved successfully');
  }

  async addToWishlist(userId: string, courseId: string) {
    const wishlist = await this.getWishlist(userId);
    const course = await this.courseModelAction.get({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    const isInWishlist = wishlist.data.wishlist.courses.some(
      (c) => c.id === courseId,
    );
    if (isInWishlist) {
      throw new BadRequestException('Course is already in your wishlist');
    }
    await this.wishListModelAction.update({
      identifierOptions: { user_id: userId },
      updatePayload: {
        courses: [...wishlist.data.wishlist.courses, course],
      },
      transactionOptions: { useTransaction: false },
    });
    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, courseId: string) {
    const wishlist = await this.getWishlist(userId);
    const courseIndex = wishlist.data.wishlist.courses.findIndex(
      (c) => c.id === courseId,
    );

    if (courseIndex === -1) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in your wishlist`,
      );
    }
    await this.wishListModelAction.update({
      identifierOptions: { user_id: userId },
      updatePayload: {
        courses: wishlist.data.wishlist.courses.filter(
          (c) => c.id !== courseId,
        ),
      },
      transactionOptions: { useTransaction: false },
    });

    return this.getWishlist(userId);
  }

  async clearWishlist(userId: string) {
    await this.wishListModelAction.update({
      identifierOptions: { user_id: userId },
      updatePayload: {
        courses: [],
      },
      transactionOptions: { useTransaction: false },
    });
    return this.getWishlist(userId);
  }

  async moveToCart(userId: string, courseId: string) {
    const wishlist = await this.getWishlist(userId);
    const courseIndex = wishlist.data.wishlist.courses.findIndex(
      (c) => c.id === courseId,
    );

    if (courseIndex === -1) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in your wishlist`,
      );
    }
    await this.cartService.addToCart(userId, courseId);
    await this.wishListModelAction.update({
      identifierOptions: { user_id: userId },
      updatePayload: {
        courses: wishlist.data.wishlist.courses.filter(
          (c) => c.id !== courseId,
        ),
      },
      transactionOptions: { useTransaction: false },
    });
    return buildResponse(
      {
        wishlist: this.getWishlist(userId),
        cart: await this.cartModelAction.get(
          { user_id: userId },
          {},
          ["items", 'items.course', 'items.course.category'],
        ),
      },
      'Course moved to cart successfully',
    );
  }
}
