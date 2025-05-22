import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { SubmitAssessmentDto } from '@dto/user-assessments.dto';
import { AuthGuard, CurrentUser, User } from '@kemuko-org/shared-utils';
import { UserAssessmentsService } from '../services/user-assessments.service';

@ApiTags('User Assessments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user-assessments')
export class UserAssessmentsController {
  constructor(
    private readonly userAssessmentsService: UserAssessmentsService,
  ) {}

  @Get(':courseId')
  @ApiOperation({ summary: 'Get all user assessments for a course' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiResponse({
    status: 200,
    description: 'User assessments retrieved successfully.',
  })
  async getCourseAssessments(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.userAssessmentsService.getCourseAssessments(user.id, courseId);
  }

  @Get(':courseId/:assessmentId')
  @ApiOperation({ summary: 'Get user assessment by assessment ID' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiResponse({
    status: 200,
    description: 'User assessment retrieved successfully.',
  })
  async getAssessment(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.userAssessmentsService.getAssessment(
      user.id,
      courseId,
      assessmentId,
    );
  }

  @Post(':courseId/:assessmentId/start')
  @ApiOperation({ summary: 'Start an assessment' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiResponse({ status: 201, description: 'Assessment started successfully.' })
  async startAssessment(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.userAssessmentsService.startAssessment(
      user.id,
      courseId,
      assessmentId,
    );
  }

  @Post(':courseId/:assessmentId/submit')
  @ApiOperation({ summary: 'Submit an assessment' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiBody({ type: SubmitAssessmentDto })
  @ApiResponse({
    status: 200,
    description: 'Assessment submitted successfully.',
  })
  async submitAssessment(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() submitAssessmentDto: SubmitAssessmentDto,
    @CurrentUser() user: User,
  ) {
    return this.userAssessmentsService.submitAssessment(
      user.id,
      courseId,
      assessmentId,
      submitAssessmentDto,
    );
  }

  @Get(':courseId/:assessmentId/results')
  @ApiOperation({ summary: 'Get assessment results' })
  @ApiParam({ name: 'courseId', description: 'ID of the course' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiResponse({
    status: 200,
    description: 'Assessment results retrieved successfully.',
  })
  async getResults(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.userAssessmentsService.getResults(
      user.id,
      courseId,
      assessmentId,
    );
  }
}
