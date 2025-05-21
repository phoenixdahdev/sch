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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LessonsService } from '../services/lessons.service';
import { AuthGuard, Roles, UserType } from '@kemuko-org/shared-utils';
import { CreateLessonDto, UpdateLessonDto } from '@dto/lessons.dto';

@ApiTags('lessons')
@Controller('modules/:moduleId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lessons for a module' })
  async findAll(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findAll(moduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by id' })
  async findOne(@Param('moduleId') moduleId: string, @Param('id') id: string) {
    return this.lessonsService.findOne(moduleId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Create a new lesson' })
  async create(
    @Param('moduleId') moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Update a lesson' })
  async update(
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(moduleId, id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Delete a lesson' })
  async remove(@Param('moduleId') moduleId: string, @Param('id') id: string) {
    return this.lessonsService.remove(moduleId, id);
  }

  @Put('reorder')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Reorder lessons' })
  async reorder(
    @Param('moduleId') moduleId: string,
    @Body() reorderDto: { lessonIds: string[] },
  ) {
    return this.lessonsService.reorder(moduleId, reorderDto.lessonIds);
  }
}
