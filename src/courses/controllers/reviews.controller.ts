import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '../dtos/reviews.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  async findAll(@Param('courseId') courseId: string, @Query() query) {
    return this.reviewsService.findAll(courseId, query);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all reviews by current user' })
  async findByUser(@Request() req, @Query() query) {
    return this.reviewsService.findByUser(req.user.id, query);
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
    @Request() req,
  ) {
    return this.reviewsService.create(courseId, createReviewDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a review' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a review' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
}
