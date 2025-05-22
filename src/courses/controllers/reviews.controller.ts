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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '@dto/reviews.dto';
import {
  AuthGuard,
  CurrentUser,
  PaginationValidator,
  User,
} from '@kemuko-org/shared-utils';

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
  @ApiOperation({ summary: 'Get all reviews by current user' })
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
  @ApiOperation({ summary: 'Create a new review' })
  async create(
    @Param('courseId') courseId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(courseId, createReviewDto, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a review' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, updateReviewDto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a review' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user.id);
  }
}
