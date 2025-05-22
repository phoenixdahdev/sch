/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
import { AssessmentsService } from '../services/assessments.service';
import {
  CreateAssessmentDto,
  UpdateAssessmentDto,
} from '../dtos/assessments.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('assessments')
@Controller('modules/:moduleId/assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assessments for a module' })
  async findAll(@Param('moduleId') moduleId: string) {
    return this.assessmentsService.findAll(moduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assessment by id' })
  async findOne(@Param('moduleId') moduleId: string, @Param('id') id: string) {
    return this.assessmentsService.findOne(moduleId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new assessment' })
  async create(
    @Param('moduleId') moduleId: string,
    @Body() createAssessmentDto: CreateAssessmentDto,
    @Request() req,
  ) {
    return this.assessmentsService.create(
      moduleId,
      createAssessmentDto,
      req.user.id,
    );
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update an assessment' })
  async update(
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
    @Request() req,
  ) {
    return this.assessmentsService.update(
      moduleId,
      id,
      updateAssessmentDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete an assessment' })
  async remove(
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.assessmentsService.remove(moduleId, id, req.user.id);
  }
}
