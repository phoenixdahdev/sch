import { Injectable, NotFoundException } from '@nestjs/common';
import { Certificate } from '@entities/certificate.entity';
import {
  UserCourseModelAction,
  CertificateModelAction,
} from '@/actions/model-actions';
import FindRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/find-record-generic';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class CertificateService {
  constructor(
    private readonly userCourseModelAction: UserCourseModelAction,
    private readonly certificateModelAction: CertificateModelAction,
  ) { }

  async findAll(findOptions: FindRecordGeneric<Partial<Certificate>>) {
    const certificates = await this.certificateModelAction.find(findOptions);
    return {
      data: { certificates: certificates.payload },
      message: 'certificates retrived successfully',
      meta: certificates.paginationMeta,
    };
  }

  async findOne(id: string, userId: string) {
    const certificate = await this.certificateModelAction.get({
      id,
      user_id: userId,
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return buildResponse({ certificate }, 'certificate retrived successfully');
  }

  async findByCourse(courseId: string, userId: string) {
    const userCourse = await this.userCourseModelAction.get({
      user_id: userId,
      course_id: courseId,
    });
    if (!userCourse) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    const certificate = await this.certificateModelAction.get({
      user_course_id: userCourse.id,
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found for this course');
    }
    return buildResponse({ certificate }, 'certificate retrived successfully');
  }

  async verify(code: string) {
    const certificate = await this.certificateModelAction.get(
      { verification_code: code },
      {},
      ["user_course", 'user_course.course'],
    );
    if (!certificate || !certificate.is_valid) {
      return buildResponse({ isValid: false }, 'certificate is not valid');
    }

    return buildResponse(
      { isValid: true, certificate },
      'certificate is valid',
    );
  }

  async download(id: string, userId: string) {
    const certificate = await this.findOne(id, userId);
    // TODO: Certificate Generation
    return buildResponse(
      { url: certificate.data.certificate.certificate_url },
      '',
    );
  }
}
