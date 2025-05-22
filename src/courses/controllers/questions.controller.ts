import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuestionsService } from '../services/questions.service';
import { AuthGuard, Roles, UserType } from '@kemuko-org/shared-utils';
import { CreateQuestionDto, UpdateQuestionDto } from '@dto/questions.dto';

@ApiTags('Questions')
@Controller('assessments/:assessmentId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions for an assessment' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiResponse({
    status: 200,
    description: 'Questions retrieved successfully.',
  })
  async findAll(@Param('assessmentId') assessmentId: string) {
    return this.questionsService.findAll(assessmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiParam({ name: 'id', description: 'ID of the question' })
  @ApiResponse({ status: 200, description: 'Question retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async findOne(
    @Param('assessmentId') assessmentId: string,
    @Param('id') id: string,
  ) {
    return this.questionsService.findOne(assessmentId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Question created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async create(
    @Param('assessmentId') assessmentId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(assessmentId, createQuestionDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiParam({ name: 'id', description: 'ID of the question' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Question updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async update(
    @Param('assessmentId') assessmentId: string,
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(assessmentId, id, updateQuestionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiParam({ name: 'id', description: 'ID of the question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async remove(
    @Param('assessmentId') assessmentId: string,
    @Param('id') id: string,
  ) {
    return this.questionsService.remove(assessmentId, id);
  }

  @Put('reorder')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder questions within an assessment' })
  @ApiParam({ name: 'assessmentId', description: 'ID of the assessment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        questionIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['q1', 'q2', 'q3'],
        },
      },
      required: ['questionIds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Questions reordered successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Some question IDs not found.' })
  async reorder(
    @Param('assessmentId') assessmentId: string,
    @Body() reorderDto: { questionIds: string[] },
  ) {
    return this.questionsService.reorder(assessmentId, reorderDto.questionIds);
  }
}
