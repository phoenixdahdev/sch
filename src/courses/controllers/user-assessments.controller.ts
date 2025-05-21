import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserAssessmentsService } from '../services/user-assessments.service';
import { SubmitAssessmentDto } from '../dtos/user-assessments.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('user-assessments')
@Controller('user-assessments')
export class UserAssessmentsController {
  constructor(
    private readonly userAssessmentsService: UserAssessmentsService,
  ) {}

  @Get(':courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all user assessments for a course' })
  async getCourseAssessments(
    @Param('courseId') courseId: string,
    @Request() req,
  ) {
    return this.userAssessmentsService.getCourseAssessments(
      req.user.id,
      courseId,
    );
  }

  @Get(':courseId/:assessmentId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user assessment by assessment id' })
  async getAssessment(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @Request() req,
  ) {
    return this.userAssessmentsService.getAssessment(
      req.user.id,
      courseId,
      assessmentId,
    );
  }

  @Post(':courseId/:assessmentId/start')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Start an assessment' })
  async startAssessment(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @Request() req,
  ) {
    return this.userAssessmentsService.startAssessment(
      req.user.id,
      courseId,
      assessmentId,
    );
  }

  @Post(':courseId/:assessmentId/submit')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Submit an assessment' })
  async submitAssessment(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() submitAssessmentDto: SubmitAssessmentDto,
    @Request() req,
  ) {
    return this.userAssessmentsService.submitAssessment(
      req.user.id,
      courseId,
      assessmentId,
      submitAssessmentDto,
    );
  }

  @Get(':courseId/:assessmentId/results')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get assessment results' })
  async getResults(
    @Param('courseId') courseId: string,
    @Param('assessmentId') assessmentId: string,
    @Request() req,
  ) {
    return this.userAssessmentsService.getResults(
      req.user.id,
      courseId,
      assessmentId,
    );
  }
}
