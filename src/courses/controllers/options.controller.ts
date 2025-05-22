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
import { OptionsService } from '../services/options.service';
import { CreateOptionDto, UpdateOptionDto } from '../dtos/options.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('options')
@Controller('questions/:questionId/options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all options for a question' })
  async findAll(@Param('questionId') questionId: string) {
    return this.optionsService.findAll(questionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an option by id' })
  async findOne(
    @Param('questionId') questionId: string,
    @Param('id') id: string,
  ) {
    return this.optionsService.findOne(questionId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new option' })
  async create(
    @Param('questionId') questionId: string,
    @Body() createOptionDto: CreateOptionDto,
    @Request() req,
  ) {
    return this.optionsService.create(questionId, createOptionDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update an option' })
  async update(
    @Param('questionId') questionId: string,
    @Param('id') id: string,
    @Body() updateOptionDto: UpdateOptionDto,
    @Request() req,
  ) {
    return this.optionsService.update(
      questionId,
      id,
      updateOptionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete an option' })
  async remove(
    @Param('questionId') questionId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.optionsService.remove(questionId, id, req.user.id);
  }
}
