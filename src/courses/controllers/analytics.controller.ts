import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { AuthGuard, CurrentUser, Roles, User } from '@kemuko-org/shared-utils';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('creator/courses')
  @ApiOperation({ summary: 'Get analytics for all creator courses' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getCreatorCourseAnalytics(
    @CurrentUser() user: User,
    @Query('period') period: string,
  ) {
    return this.analyticsService.getCreatorCourseAnalytics(user.id, period);
  }

  @Get('creator/courses/:courseId')
  @ApiOperation({ summary: 'Get analytics for a specific creator course' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getCreatorCourseDetailAnalytics(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
    @Query('period') period: string,
  ) {
    return this.analyticsService.getCreatorCourseDetailAnalytics(
      user.id,
      courseId,
      period,
    );
  }

  @Get('creator/revenue')
  @ApiOperation({ summary: 'Get revenue analytics for creator' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getCreatorRevenueAnalytics(
    @CurrentUser() user: User,
    @Query('period') period: string,
  ) {
    return this.analyticsService.getCreatorRevenueAnalytics(user.id, period);
  }

  @Get('creator/students')
  @ApiOperation({ summary: 'Get student engagement analytics for creator' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getCreatorStudentAnalytics(
    @CurrentUser() user: User,
    @Query('period') period: string,
  ) {
    return this.analyticsService.getCreatorStudentAnalytics(user.id, period);
  }

  @Get('student/learning')
  @ApiOperation({ summary: 'Get learning progress analytics for student' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getStudentLearningAnalytics(
    @CurrentUser() user: User,
    @Query('period') period: string,
  ) {
    return this.analyticsService.getStudentLearningAnalytics(
      user.id,
      period,
    );
  }

  @Get('student/performance')
  @ApiOperation({ summary: 'Get performance metrics for student' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getStudentPerformanceAnalytics(
    @CurrentUser() user: User,
    @Query('period') period: string,
  ) {
    return this.analyticsService.getStudentPerformanceAnalytics(
      user.id,
      period,
    );
  }

  @Get('admin/platform')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get platform-wide analytics (admin only)' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getAdminPlatformAnalytics(
    @Query('period') period: string,
  ) {
    return this.analyticsService.getAdminPlatformAnalytics(period);
  }

  @Get('admin/revenue')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get platform revenue analytics (admin only)' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analytics (e.g. week, month, year)' })
  async getAdminRevenueAnalytics(
    @Query('period') period: string,
  ) {
    return this.analyticsService.getAdminRevenueAnalytics(period);
  }

  @Get('admin/users')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get platform user analytics (admin only)' })
  getAdminUserAnalytics() {
    return this.analyticsService.getAdminUserAnalytics();
  }

  @Get('admin/courses')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get platform course analytics (admin only)' })
  async getAdminCourseAnalytics() {
    return this.analyticsService.getAdminCourseAnalytics();
  }
}
