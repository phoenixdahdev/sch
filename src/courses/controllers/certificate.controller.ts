import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificateService } from '../services/certificate.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all certificates for current user' })
  async findAll(@Request() req) {
    return this.certificateService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get certificate by id' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.certificateService.findOne(id, req.user.id);
  }

  @Get('course/:courseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get certificate by course id' })
  async findByCourse(@Param('courseId') courseId: string, @Request() req) {
    return this.certificateService.findByCourse(courseId, req.user.id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate' })
  async verify(@Param('code') code: string) {
    return this.certificateService.verify(code);
  }

  @Get(':id/download')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Download certificate' })
  async download(@Param('id') id: string, @Request() req) {
    return this.certificateService.download(id, req.user.id);
  }
}
