/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dtos/report.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('course/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Report a course' })
  async reportCourse(
    @Param('courseId') courseId: string,
    @Body() createReportDto: CreateReportDto,
    @Request() req,
  ) {
    return this.reportService.reportCourse(
      courseId,
      createReportDto,
      req.user.id,
    );
  }

  @Post('review/:reviewId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Report a review' })
  async reportReview(
    @Param('reviewId') reviewId: string,
    @Body() createReportDto: CreateReportDto,
    @Request() req,
  ) {
    return this.reportService.reportReview(
      reviewId,
      createReportDto,
      req.user.id,
    );
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all reports' })
  async findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get a report by id' })
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Post(':id/resolve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Resolve a report' })
  async resolve(
    @Param('id') id: string,
    @Body() resolveDto: { resolution: string },
  ) {
    return this.reportService.resolve(id, resolveDto.resolution);
  }
}
