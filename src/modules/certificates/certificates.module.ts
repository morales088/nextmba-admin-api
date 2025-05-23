import { Module } from '@nestjs/common';
import { CertificatesController } from './controllers/certificates.controller';
import { StudentCertificatesService } from './services/certificates.service';
import { StudentCertificateRepository } from './repositories/student-certificate.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PdfService } from 'src/common/utils/pdf.service';
import { CertificateRepository } from './repositories/certificate.repository';
import { ModuleRepository } from '../modules/repositories/module.repository';
import { CertificateApiController } from './controllers/certificate_api.controller';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { CoursesService } from '../courses/services/courses.service';
import { CourseRepository } from '../courses/repositories/course.repository';
import { StudentRepository } from '../students/repositories/student.repository';
import { QrService } from './services/qr.service';
import { StudentCoursesRepository } from '../students/repositories/student_courses.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CertificatesController, CertificateApiController],
  providers: [
    StudentCertificatesService,
    StudentCertificateRepository,
    CertificateRepository,
    ModuleRepository,
    PdfService,
    SendMailService,
    CoursesService,
    QrService,
    CourseRepository,
    StudentRepository,
    StudentCoursesRepository
  ],
})
export class CertificatesModule {}
