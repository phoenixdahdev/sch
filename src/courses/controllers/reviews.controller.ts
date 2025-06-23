import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  AuthGuard,
  CurrentUser,
  PaginationValidator,
  User,
} from '@kemuko-org/shared-utils';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '@dto/reviews.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  async findAll(
    @Param('courseId') courseId: string,
    @Query() pagination?: PaginationValidator,
  ) {
    const listOptions = {
      filterRecordOptions: {
        course_id: courseId,
      },
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
    };
    return this.reviewsService.findAll(listOptions);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all reviews by current user (requires authentication)',
  })
  async findByUser(
    @CurrentUser() user: User,
    @Query() pagination?: PaginationValidator,
  ) {
    const listOptions = {
      filterRecordOptions: {
        user_id: user.id,
      },
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
    };
    return this.reviewsService.findAll(listOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by id' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post('course/:courseId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new review (requires authentication)',
  })
  async create(
    @Param('courseId') courseId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(courseId, createReviewDto, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a review (requires authentication)',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, updateReviewDto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a review (requires authentication)',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user.id);
  }
}
