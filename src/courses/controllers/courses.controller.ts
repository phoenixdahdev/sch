import {
  AuthGuard,
  CurrentUser,
  PaginationValidator,
  Roles,
  User,
  UserType,
} from '@kemuko-org/shared-utils';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from '../services/course.service';
import {
  CourseFilterDto,
  CourseSortBy,
  CreateCourseDto,
  SortDirection,
  UpdateCourseDto,
} from '@dto/courses.dto';
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
import { Course } from '@entities/course.entity';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';
import { Review } from '@entities/review.entity';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Get()
  @ApiOperation({
    summary: 'Get courses with flexible filtering',
    description: `
      Returns a paginated list of courses with various filtering options.
      
      Examples:
      - Get all courses: GET /courses
      - Get featured courses: GET /courses?isFeatured=true
      - Get top-rated courses: GET /courses?sortBy=average_rating&sortDirection=DESC
      - Get courses by category: GET /courses?categoryId=123
      - Get courses by creator: GET /courses?creatorId=456
      - Get free courses: GET /courses?isFree=true
      - Get courses by level: GET /courses?level=Beginner
      - Search courses: GET /courses?search=javascript
    `,
  })
  async findAll(@Query() filters: CourseFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      creatorId,
      isFeatured,
      isPublished,
      isFree,
      level,
      sortBy = CourseSortBy.CREATED_AT,
      sortDirection = SortDirection.DESC,
    } = filters;
    const filterOptions: Partial<Course> = {};

    if (categoryId) filterOptions.category_id = categoryId;
    if (creatorId) filterOptions.creator_id = creatorId;
    if (isFeatured !== undefined) filterOptions.is_featured = isFeatured;
    if (isPublished !== undefined) filterOptions.is_published = isPublished;
    if (isFree !== undefined) filterOptions.is_free = isFree;
    if (level) filterOptions.level = level;

    const listOptions: ListRecordGeneric<Partial<Course>> = {
      filterRecordOptions: filterOptions,
      paginationPayload: {
        page: Number(page),
        limit: Number(limit),
      },
      order: { [sortBy]: sortDirection },
    };
    if (search) {
      return this.coursesService.searchCourses(search, listOptions);
    }
    return this.coursesService.findAll(listOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by id' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (requires authentication)' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course (requires authentication)' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course (requires authentication)' })
  async remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a course (requires authentication)' })
  async publish(@Param('id') id: string) {
    const updateDto: UpdateCourseDto = { is_published: true };
    return this.coursesService.update(id, updateDto);
  }

  @Post(':id/unpublish')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a course (requires authentication)' })
  async unpublish(@Param('id') id: string) {
    const updateDto: UpdateCourseDto = { is_published: false };
    return this.coursesService.update(id, updateDto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get course reviews' })
  async getCourseReviews(
    @Param('id') id: string,
    @Query() pagination?: PaginationValidator,
  ) {
    const listOptions: ListRecordGeneric<Partial<Review>> = {
      filterRecordOptions: { course_id: id },
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
      order: { created_at: 'DESC' },
    };
    return this.coursesService.getCourseReviews(listOptions);
  }
}
