import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PromotionService } from '../services/promotion.service';
import {
  AuthGuard,
  PaginationValidator,
  Roles,
  UserType,
} from '@kemuko-org/shared-utils';
import ListRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/list-record-generic';
import { Promotion } from '@entities/promotion.entity';
import { CreatePromotionDto, UpdatePromotionDto } from '@dto/promotion.dto';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of promotions',
    type: [Promotion],
  })
  async findAll(@Query() pagination?: PaginationValidator) {
    const listoptions: ListRecordGeneric<Partial<Promotion>> = {
      filterRecordOptions: {},
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
      relations: { applicable_courses: true },
    };
    return this.promotionService.findAll(listoptions);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a promotion by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Promotion found', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiBody({ type: CreatePromotionDto })
  @ApiResponse({
    status: 201,
    description: 'Promotion created successfully',
    type: Promotion,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promotion' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePromotionDto })
  @ApiResponse({
    status: 200,
    description: 'Promotion updated successfully',
    type: Promotion,
  })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promotion' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }

  @Put(':id/activation')
  @UseGuards(AuthGuard)
  @Roles([UserType.Admin])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle promotion activation' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' },
      },
      required: ['isActive'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion activation status updated',
  })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async toggleActivation(
    @Param('id') id: string,
    @Body() payload: { isActive: boolean },
  ) {
    return this.promotionService.toggleActivation(id, payload.isActive);
  }

  @Get('code/:code/validate')
  @ApiOperation({ summary: 'Validate promotion code' })
  @ApiParam({ name: 'code', type: String })
  @ApiResponse({ status: 200, description: 'Code validation result' })
  @ApiResponse({
    status: 404,
    description: 'Promotion code not found or inactive',
  })
  async validate(@Param('code') code: string) {
    return this.promotionService.validate(code);
  }
}
