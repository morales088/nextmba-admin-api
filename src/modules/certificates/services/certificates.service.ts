import { Injectable } from '@nestjs/common';
import { StudentCertificateRepository } from '../repositories/student-certificate.repository';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';
import { CertificateRepository } from '../repositories/certificate.repository';
import { ModuleRepository } from 'src/modules/modules/repositories/module.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { StudentRepository } from 'src/modules/students/repositories/student.repository';

@Injectable()
export class StudentCertificatesService {
  constructor(
    private readonly studentCertificateRepository: StudentCertificateRepository,
    private readonly certificateRepository: CertificateRepository,
    private readonly moduleRepository: ModuleRepository,
    private readonly sendMailService: SendMailService,
    private readonly studentRepository: StudentRepository,
  ) {}

  async getStudCertificates() {
    return await this.studentCertificateRepository.find();
  }

  async getStudCertificate(id: number) {
    return await this.studentCertificateRepository.findById(id);
  }

  async attendanceCert() {
    return await this.certificateRepository.attendanceCert();
  }

  async getCertificateByCode(code: string) {
    return await this.studentCertificateRepository.findByCode(code);
  }

  async createCertificate(data: object) {
    return await this.studentCertificateRepository.insert(data);
  }

  async updateCertificate(id: number, data: any) {
    const certificate = await this.studentCertificateRepository.findById(id);
    const student = certificate.student
    const course = certificate.course

    const downloadLink = process.env.ADMIN_API_ROUTE + '/api/certificate-api/download/' + certificate.certificate_code
      
    if(data.download) await this.sendMailService.emailCertificateInformation(student.name, course.name, downloadLink);

    
    const { download, ...newData} = data // remove download to object

    return await this.studentCertificateRepository.updateCertificate(id, newData);
  }

  async getCertificate(tier: number = 1) {
    return await this.certificateRepository.certificate(tier);
  }

  async getPreviousModules(userId: number, courseId: number) {

    const previousModules = await this.moduleRepository.previousModules(userId, courseId);
    return { student_modules: previousModules };
  }
  
  async getStudentByEmail(email: string) {
    return this.studentRepository.findByEmail(email);
  }
}
