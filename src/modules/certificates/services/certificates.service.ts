import { Injectable } from '@nestjs/common';
import { StudentCertificateRepository } from '../repositories/student-certificate.repository';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';
import { CertificateRepository } from '../repositories/certificate.repository';
import { ModuleRepository } from 'src/modules/modules/repositories/module.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';

@Injectable()
export class StudentCertificatesService {
  constructor(
    private readonly studentCertificateRepository: StudentCertificateRepository,
    private readonly certificateRepository: CertificateRepository,
    private readonly moduleRepository: ModuleRepository,
    private readonly sendMailService: SendMailService
  ) {}

  async getStudCertificates() {
    return await this.studentCertificateRepository.find();
  }

  async getStudCertificate(id: number) {
    return await this.studentCertificateRepository.findById(id);
  }

  async getCertificateByCode(code: string) {
    return await this.studentCertificateRepository.findByCode(code);
  }

  async createCertificate(data: CreateCertificateDto) {
    return await this.studentCertificateRepository.insert(data);
  }

  async updateCertificate(id: number, data: UpdateCertificateDto) {
    const certificate = await this.studentCertificateRepository.findById(id);
    const student = certificate.student
    const course = certificate.course

    const downloadLink = process.env.ADMIN_API_ROUTE + '/api/certificate-api/download/' + certificate.certificate_code
      
    if(data.download) await this.sendMailService.emailCertificateInformation(student.name, course.name, downloadLink);


    return await this.studentCertificateRepository.updateCertificate(id, data);
  }

  async getCertificate(tier: number = 1) {
    return await this.certificateRepository.certificate(tier);
  }

  async getPreviousModules(userId: number, courseId: number) {

    const previousModules = await this.moduleRepository.previousModules(userId, courseId);
    return { student_modules: previousModules };
  }
}
