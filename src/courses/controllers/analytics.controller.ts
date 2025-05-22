/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Creator analytics
  @Get('creator/courses')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get analytics for creator courses' })
  async getCreatorCourseAnalytics(@Request() req, @Query() query) {
    return this.analyticsService.getCreatorCourseAnalytics(req.user.id, query);
  }

  @Get('creator/courses/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get analytics for a specific creator course' })
  async getCreatorCourseDetailAnalytics(
    @Param('courseId') courseId: string,
    @Request() req,
    @Query() query,
  ) {
    return this.analyticsService.getCreatorCourseDetailAnalytics(
      req.user.id,
      courseId,
      query,
    );
  }

  @Get('creator/revenue')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get revenue analytics for creator' })
  async getCreatorRevenueAnalytics(@Request() req, @Query() query) {
    return this.analyticsService.getCreatorRevenueAnalytics(req.user.id, query);
  }

  @Get('creator/students')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get student analytics for creator' })
  async getCreatorStudentAnalytics(@Request() req, @Query() query) {
    return this.analyticsService.getCreatorStudentAnalytics(req.user.id, query);
  }

  // Student analytics
  @Get('student/learning')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get learning analytics for student' })
  async getStudentLearningAnalytics(@Request() req, @Query() query) {
    return this.analyticsService.getStudentLearningAnalytics(
      req.user.id,
      query,
    );
  }

  @Get('student/performance')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get performance analytics for student' })
  async getStudentPerformanceAnalytics(@Request() req, @Query() query) {
    return this.analyticsService.getStudentPerformanceAnalytics(
      req.user.id,
      query,
    );
  }

  // Admin analytics
  @Get('admin/platform')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get platform analytics for admin' })
  async getAdminPlatformAnalytics(@Query() query) {
    return this.analyticsService.getAdminPlatformAnalytics(query);
  }

  @Get('admin/revenue')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get revenue analytics for admin' })
  async getAdminRevenueAnalytics(@Query() query) {
    return this.analyticsService.getAdminRevenueAnalytics(query);
  }

  @Get('admin/users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user analytics for admin' })
  async getAdminUserAnalytics(@Query() query) {
    return this.analyticsService.getAdminUserAnalytics(query);
  }

  @Get('admin/courses')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get course analytics for admin' })
  async getAdminCourseAnalytics(@Query() query) {
    return this.analyticsService.getAdminCourseAnalytics(query);
  }
}
