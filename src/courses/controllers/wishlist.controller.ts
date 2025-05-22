import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from '../services/wishlist.service';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post('add/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add course to wishlist' })
  async addToWishlist(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.wishlistService.addToWishlist(user.id, courseId);
  }

  @Delete('remove/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove course from wishlist' })
  async removeFromWishlist(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.wishlistService.removeFromWishlist(user.id, courseId);
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear wishlist' })
  async clearWishlist(@CurrentUser() user: User) {
    return this.wishlistService.clearWishlist(user.id);
  }

  @Post('move-to-cart/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Move course from wishlist to cart' })
  async moveToCart(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.wishlistService.moveToCart(user.id, courseId);
  }
}
