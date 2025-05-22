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
import { AuthGuard, Roles, UserType } from '@kemuko-org/shared-utils';
import { AssessmentsService } from '../services/assessments.service';
import { CreateAssessmentDto, UpdateAssessmentDto } from '@dto/assessments.dto';

@ApiTags('Assessments')
@Controller('modules/:moduleId/assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assessments for a module' })
  @ApiParam({ name: 'moduleId', type: String, description: 'ID of the module' })
  @ApiResponse({
    status: 200,
    description: 'List of assessments retrieved successfully.',
  })
  async findAll(@Param('moduleId') moduleId: string) {
    return this.assessmentsService.findAll(moduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single assessment by ID' })
  @ApiParam({ name: 'moduleId', type: String, description: 'ID of the module' })
  @ApiParam({ name: 'id', type: String, description: 'ID of the assessment' })
  @ApiResponse({
    status: 200,
    description: 'Assessment retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  async findOne(@Param('moduleId') moduleId: string, @Param('id') id: string) {
    return this.assessmentsService.findOne(moduleId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new assessment' })
  @ApiParam({ name: 'moduleId', type: String, description: 'ID of the module' })
  @ApiBody({
    type: CreateAssessmentDto,
    description: 'Assessment creation payload',
  })
  @ApiResponse({ status: 201, description: 'Assessment created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async create(
    @Param('moduleId') moduleId: string,
    @Body() createAssessmentDto: CreateAssessmentDto,
  ) {
    return this.assessmentsService.create(moduleId, createAssessmentDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing assessment' })
  @ApiParam({ name: 'moduleId', type: String, description: 'ID of the module' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the assessment to update',
  })
  @ApiBody({
    type: UpdateAssessmentDto,
    description: 'Assessment update payload',
  })
  @ApiResponse({ status: 200, description: 'Assessment updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid update data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  async update(
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
  ) {
    return this.assessmentsService.update(moduleId, id, updateAssessmentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an assessment' })
  @ApiParam({ name: 'moduleId', type: String, description: 'ID of the module' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the assessment to delete',
  })
  @ApiResponse({ status: 200, description: 'Assessment deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Assessment not found.' })
  async remove(@Param('moduleId') moduleId: string, @Param('id') id: string) {
    return this.assessmentsService.remove(moduleId, id);
  }
}
