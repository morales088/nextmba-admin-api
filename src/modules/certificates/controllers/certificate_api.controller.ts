import { Controller, Get, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import { PdfService } from 'src/common/utils/pdf.service';
import { StudentCertificatesService } from '../services/certificates.service';
import { Response } from 'express';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('certificate-api')
// @UseGuards(ApiKeyGuard)
export class CertificateApiController {
    constructor(
      private readonly studentCertificatesService: StudentCertificatesService,
      private readonly pdfService: PdfService
    ) {}

    @Get('/download/:studentCertificateCode')
    async generateCertificate(
      @Res() res: Response,
      @Param('studentCertificateCode') studentCertificateCode: string
    ): Promise<any> {
      const studCertificate = await this.studentCertificatesService.getCertificateByCode(studentCertificateCode);
      const studentInfo = studCertificate.student;
  
      const htmlFilePath = 'src/common/templates/certificate.template.html';
  
      let moduleHtml = '';
      const result = await this.studentCertificatesService.getPreviousModules(studentInfo.id);
      const certificate = await this.studentCertificatesService.getCertificate(studCertificate.course_id);
  
      if(certificate && result.student_modules.length < 12) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Template not available. / Not yet complete the course.' });
  
      let date;
      for (let i = 0; i < result.student_modules.length; i++) {
        if (i > 11) break;
        const module = result.student_modules[i];
        moduleHtml += `<div class="child">${module.name}.</div>`;
        date = module.start_date;
      }
  
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
        // second: '2-digit',
        // timeZoneName: 'short',
        // timeZone: 'UTC',
      };
  
      const formattedDate = date.toLocaleDateString('en-US', options);
  
      let fontSize: string;
      if (studentInfo.name.length <= 24) fontSize = '60px';
      else if (studentInfo.name.length <= 29) fontSize = '50px';
      else fontSize = '42px';
  
      const data = {
        name: studentInfo.name,
        nameFontSize: fontSize,
        modules: moduleHtml,
        template: certificate.template,
        certificate_id: studCertificate.certificate_code,
        certificate_date: formattedDate,
      };
  
      const pdfBuffer = await this.pdfService.certificateGeneratePdf(htmlFilePath, data);
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
  
      res.send(pdfBuffer);
    }
}
