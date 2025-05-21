import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post('add/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add course to cart' })
  async addToCart(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.cartService.addToCart(user.id, courseId);
  }

  @Delete('remove/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove course from cart' })
  async removeFromCart(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.cartService.removeFromCart(user.id, courseId);
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }

  @Post('checkout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Checkout cart' })
  async checkout(@CurrentUser() user: User) {
    return this.cartService.checkout(user.id);
  }

  @Post('apply-promotion/:code')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Apply promotion to cart' })
  async applyPromotion(@Param('code') code: string, @CurrentUser() user: User) {
    return this.cartService.applyPromotion(user.id, code);
  }

  @Delete('remove-promotion')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove promotion from cart' })
  async removePromotion(@CurrentUser() user: User) {
    return this.cartService.removePromotion(user.id);
  }
}
