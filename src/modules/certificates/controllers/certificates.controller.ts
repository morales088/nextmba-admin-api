import { Body, Controller, Get, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentCertificatesService } from '../services/certificates.service';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';
import { Response } from 'express';
import { PdfService } from 'src/common/utils/pdf.service';
import { StudentsService } from 'src/modules/students/services/students.service';

@Controller('certificate')
@UseGuards(AuthGuard('jwt'))
export class CertificatesController {
  constructor(
    private readonly studentCertificatesService: StudentCertificatesService,
  ) {}

  @Get('/')
  async getStudCertificates() {
    return await this.studentCertificatesService.getStudCertificates();
  }

  @Get('/:certificateId')
  async getStudCertificate(@Param('certificateId') certificateId: number) {
    return await this.studentCertificatesService.getStudCertificate(certificateId);
  }

  @Post('/')
  async createCertificate(@Body() createCertificateDto: CreateCertificateDto) {
    const student = await this.studentCertificatesService.getStudentByEmail(createCertificateDto.student_email)

    const { student_email, ...newData} = createCertificateDto // remove student_email to object
    const certificateData = {
      ...newData,
      student_id : student.id
    };
    
    return await this.studentCertificatesService.createCertificate(certificateData);
  }

  @Put('/:certificateId')
  async updateCertificate(
    @Param('certificateId') certificateId: number,
    @Body() updateCertificateDto: UpdateCertificateDto
  ) {
    const student = await this.studentCertificatesService.getStudentByEmail(updateCertificateDto.student_email)

    const { student_email, ...newData} = updateCertificateDto // remove student_email to object
    const certificateData = {
      ...newData,
      student_id : student.id
    };

    return await this.studentCertificatesService.updateCertificate(certificateId, certificateData);
  }
}
