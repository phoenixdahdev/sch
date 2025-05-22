import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserCoursesService } from '../services/user-courses.service';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';
import { UserCourseQueryDto } from '@dto/user-course-query.dto';

@ApiTags('user-courses')
@ApiBearerAuth()
@Controller('user-courses')
export class UserCoursesController {
  constructor(private readonly userCoursesService: UserCoursesService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user courses by status (all, in-progress, completed)',
  })
  async findAll(@CurrentUser() user: User, @Query() query: UserCourseQueryDto) {
    const { status = 'all', page = '1', limit = '10' } = query;

    const orderBy =
      status === 'completed'
        ? { completed_at: 'DESC' as const }
        : status === 'in-progress'
          ? { updated_at: 'DESC' as const }
          : { enrolled_at: 'DESC' as const };

    const listOptions = {
      filterRecordOptions: {
        user_id: user.id,
        ...(status === 'completed' && { is_completed: true }),
        ...(status === 'in-progress' && {
          is_completed: false,
          progress_percentage: 0,
        }),
      },
      paginationPayload: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
      order: orderBy,
    };

    return this.userCoursesService.findAll(listOptions);
  }

  @Get(':courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user course by course id' })
  async findOne(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.userCoursesService.findOne(user.id, courseId);
  }

  @Post(':courseId/enroll')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Enroll in a course' })
  async enroll(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.userCoursesService.enroll(user.id, courseId);
  }

  @Delete(':courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unenroll from a course' })
  async remove(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.userCoursesService.remove(user.id, courseId);
  }

  @Get(':courseId/progress')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user progress for a course' })
  async getProgress(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.userCoursesService.getProgress(user.id, courseId);
  }

  @Post(':courseId/certificate')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Generate certificate for a completed course' })
  async generateCertificate(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.userCoursesService.generateCertificate(user, courseId);
  }
}
