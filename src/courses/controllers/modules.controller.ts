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
import { ModulesService } from '../services/modules.service';
import { CreateModuleDto, UpdateModuleDto } from '@dto/modules.dto';
import { AuthGuard, Roles, UserType } from '@kemuko-org/shared-utils';

@ApiTags('modules')
@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all modules for a course' })
  async findAll(@Param('courseId') courseId: string) {
    return this.modulesService.findAll(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a module by id' })
  async findOne(@Param('courseId') courseId: string, @Param('id') id: string) {
    return this.modulesService.findOne(courseId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Create a new module' })
  async create(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, createModuleDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Update a module' })
  async update(
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(courseId, id, updateModuleDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Delete a module' })
  async remove(@Param('courseId') courseId: string, @Param('id') id: string) {
    return this.modulesService.remove(courseId, id);
  }

  @Put('reorder')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiOperation({ summary: 'Reorder modules' })
  async reorder(
    @Param('courseId') courseId: string,
    @Body() reorderDto: { moduleIds: string[] },
  ) {
    return this.modulesService.reorder(courseId, reorderDto.moduleIds);
  }
}
