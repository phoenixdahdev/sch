import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from '../services/wishlist.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post('add/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add course to wishlist' })
  async addToWishlist(@Param('courseId') courseId: string, @Request() req) {
    return this.wishlistService.addToWishlist(req.user.id, courseId);
  }

  @Delete('remove/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove course from wishlist' })
  async removeFromWishlist(
    @Param('courseId') courseId: string,
    @Request() req,
  ) {
    return this.wishlistService.removeFromWishlist(req.user.id, courseId);
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear wishlist' })
  async clearWishlist(@Request() req) {
    return this.wishlistService.clearWishlist(req.user.id);
  }

  @Post('move-to-cart/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Move course from wishlist to cart' })
  async moveToCart(@Param('courseId') courseId: string, @Request() req) {
    return this.wishlistService.moveToCart(req.user.id, courseId);
  }
}
