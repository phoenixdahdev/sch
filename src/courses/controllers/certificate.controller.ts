import {
  AuthGuard,
  CurrentUser,
  PaginationValidator,
  User,
} from '@kemuko-org/shared-utils';
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CertificateService } from '../services/certificate.service';
import FindRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/find-record-generic';
import { Certificate } from '@entities/certificate.entity';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) { }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all certificates for current user' })
  @ApiResponse({ status: 200, description: 'List of user certificates retrieved successfully.' })
  async findAll(
    @CurrentUser() user: User,
    @Query() pagination?: PaginationValidator,
  ) {
    const findOption: FindRecordGeneric<Partial<Certificate>> = {
      findOptions: { user_id: user.id },
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
      order: { issued_at: 'DESC' },
      transactionOptions: { useTransaction: false },
    };
    return this.certificateService.findAll(findOption);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate by id' })
  @ApiResponse({ status: 200, description: 'Certificate retrieved successfully.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.certificateService.findOne(id, user.id);
  }

  @Get('course/:courseId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate by course id' })
  @ApiResponse({ status: 200, description: 'Certificate for course retrieved successfully.' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.certificateService.findByCourse(courseId, user.id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate' })
  @ApiResponse({ status: 200, description: 'Certificate verification result returned.' })
  async verify(@Param('code') code: string) {
    return this.certificateService.verify(code);
  }

  @Get(':id/download')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download certificate' })
  @ApiResponse({ status: 200, description: 'Certificate downloaded successfully (stream response).' })
  async download(@Param('id') id: string, @CurrentUser() user: User) {
    return this.certificateService.download(id, user.id);
  }
}
