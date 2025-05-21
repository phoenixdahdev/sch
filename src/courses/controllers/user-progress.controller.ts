import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserProgressService } from '../services/user-progress.service';
import { UpdateProgressDto } from '../dtos/user-progress.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('user-progress')
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Get(':courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user progress for a course' })
  async getCourseProgress(@Param('courseId') courseId: string, @Request() req) {
    return this.userProgressService.getCourseProgress(req.user.id, courseId);
  }

  @Get(':courseId/:lessonId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user progress for a lesson' })
  async getLessonProgress(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Request() req,
  ) {
    return this.userProgressService.getLessonProgress(
      req.user.id,
      courseId,
      lessonId,
    );
  }

  @Put(':courseId/:lessonId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user progress for a lesson' })
  async updateProgress(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req,
  ) {
    return this.userProgressService.updateProgress(
      req.user.id,
      courseId,
      lessonId,
      updateProgressDto,
    );
  }

  @Post(':courseId/:lessonId/complete')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  async completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Request() req,
  ) {
    return this.userProgressService.completeLesson(
      req.user.id,
      courseId,
      lessonId,
    );
  }
}
