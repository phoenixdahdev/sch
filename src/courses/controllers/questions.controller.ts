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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuestionsService } from '../services/questions.service';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/questions.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('questions')
@Controller('assessments/:assessmentId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions for an assessment' })
  async findAll(@Param('assessmentId') assessmentId: string) {
    return this.questionsService.findAll(assessmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by id' })
  async findOne(
    @Param('assessmentId') assessmentId: string,
    @Param('id') id: string,
  ) {
    return this.questionsService.findOne(assessmentId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new question' })
  async create(
    @Param('assessmentId') assessmentId: string,
    @Body() createQuestionDto: CreateQuestionDto,
    @Request() req,
  ) {
    return this.questionsService.create(
      assessmentId,
      createQuestionDto,
      req.user.id,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a question' })
  async update(
    @Param('assessmentId') assessmentId: string,
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Request() req,
  ) {
    return this.questionsService.update(
      assessmentId,
      id,
      updateQuestionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a question' })
  async remove(
    @Param('assessmentId') assessmentId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.questionsService.remove(assessmentId, id, req.user.id);
  }

  @Put('reorder')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Reorder questions' })
  async reorder(
    @Param('assessmentId') assessmentId: string,
    @Body() reorderDto: { questionIds: string[] },
    @Request() req,
  ) {
    return this.questionsService.reorder(
      assessmentId,
      reorderDto.questionIds,
      req.user.id,
    );
  }
}
