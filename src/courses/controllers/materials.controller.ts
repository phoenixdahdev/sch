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
import { MaterialsService } from '../services/materials.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, Roles, UserType } from '@kemuko-org/shared-utils';
import { CreateMaterialDto, UpdateMaterialDto } from '@dto/materials.dto';

@ApiTags('materials')
@Controller('lessons/:lessonId/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all materials for a lesson' })
  async findAll(@Param('lessonId') lessonId: string) {
    return this.materialsService.findAll(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material by id' })
  async findOne(@Param('lessonId') lessonId: string, @Param('id') id: string) {
    return this.materialsService.findOne(lessonId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new material' })
  async create(
    @Param('lessonId') lessonId: string,
    @Body() createMaterialDto: CreateMaterialDto,
  ) {
    return this.materialsService.create(lessonId, createMaterialDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a material' })
  async update(
    @Param('lessonId') lessonId: string,
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(lessonId, id, updateMaterialDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin, UserType.Instructor])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a material' })
  async remove(@Param('lessonId') lessonId: string, @Param('id') id: string) {
    return this.materialsService.remove(lessonId, id);
  }
}
