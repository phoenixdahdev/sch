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
import { OptionsService } from '../services/options.service';
import { CreateOptionDto, UpdateOptionDto } from '@dto/options.dto';
import { AuthGuard, Roles, UserType } from '@kemuko-org/shared-utils';

@ApiTags('Options')
@Controller('questions/:questionId/options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all options for a question' })
  @ApiParam({ name: 'questionId', description: 'ID of the question' })
  @ApiResponse({ status: 200, description: 'Options retrieved successfully.' })
  async findAll(@Param('questionId') questionId: string) {
    return this.optionsService.findAll(questionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an option by ID' })
  @ApiParam({ name: 'questionId', description: 'ID of the question' })
  @ApiParam({ name: 'id', description: 'ID of the option' })
  @ApiResponse({ status: 200, description: 'Option retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Option not found.' })
  async findOne(
    @Param('questionId') questionId: string,
    @Param('id') id: string,
  ) {
    return this.optionsService.findOne(questionId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new option' })
  @ApiParam({ name: 'questionId', description: 'ID of the question' })
  @ApiBody({ type: CreateOptionDto })
  @ApiResponse({ status: 201, description: 'Option created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 400, description: 'Invalid request payload.' })
  async create(
    @Param('questionId') questionId: string,
    @Body() createOptionDto: CreateOptionDto,
  ) {
    return this.optionsService.create(questionId, createOptionDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an option' })
  @ApiParam({ name: 'questionId', description: 'ID of the question' })
  @ApiParam({ name: 'id', description: 'ID of the option' })
  @ApiBody({ type: UpdateOptionDto })
  @ApiResponse({ status: 200, description: 'Option updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Option not found.' })
  async update(
    @Param('questionId') questionId: string,
    @Param('id') id: string,
    @Body() updateOptionDto: UpdateOptionDto,
  ) {
    return this.optionsService.update(questionId, id, updateOptionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an option' })
  @ApiParam({ name: 'questionId', description: 'ID of the question' })
  @ApiParam({ name: 'id', description: 'ID of the option' })
  @ApiResponse({ status: 200, description: 'Option deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Option not found.' })
  async remove(
    @Param('questionId') questionId: string,
    @Param('id') id: string,
  ) {
    return this.optionsService.remove(questionId, id);
  }
}
