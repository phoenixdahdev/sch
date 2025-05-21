import {
  AuthGuard,
  CurrentUser,
  PaginationValidator,
  User,
} from '@kemuko-org/shared-utils';
import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificateService } from '../services/certificate.service';
import FindRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/find-record-generic';
import { Certificate } from '@entities/certificate.entity';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all certificates for current user' })
  async findAll(
    @CurrentUser() user: User,
    @Query() pagination?: PaginationValidator,
  ) {
    const findOption: FindRecordGeneric<Partial<Certificate>> = {
      findOptions: {
        user_id: user.id,
      },
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
      order: { issued_at: 'DESC' },
      transactionOptions: {
        useTransaction: false,
      },
    };
    return this.certificateService.findAll(findOption);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get certificate by id' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.certificateService.findOne(id, user.id);
  }

  @Get('course/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get certificate by course id' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.certificateService.findByCourse(courseId, user.id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate' })
  async verify(@Param('code') code: string) {
    return this.certificateService.verify(code);
  }

  @Get(':id/download')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Download certificate' })
  async download(@Param('id') id: string, @CurrentUser() user: User) {
    return this.certificateService.download(id, user.id);
  }
}
