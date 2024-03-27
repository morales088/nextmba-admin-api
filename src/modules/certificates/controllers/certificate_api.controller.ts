import { Controller, Get, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import { PdfService } from 'src/common/utils/pdf.service';
import { StudentCertificatesService } from '../services/certificates.service';
import { Response } from 'express';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { CoursesService } from 'src/modules/courses/services/courses.service';

@Controller('certificate-api')
// @UseGuards(ApiKeyGuard)
export class CertificateApiController {
  constructor(
    private readonly studentCertificatesService: StudentCertificatesService,
    private readonly coursesService: CoursesService,
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

    let moduleHtml = [];
    const result = await this.studentCertificatesService.getPreviousModules(studentInfo.id, studCertificate.course_id);
    const certificate = await this.studentCertificatesService.getCertificate(studCertificate.certificate_tier);
    const course = await this.coursesService.getCourse(studCertificate.course_id);
    const courseName = course.name.split('+')[0];

    // if(certificate && result.student_modules.length < 12) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Template not available. / Not yet complete the course.' });

    let endDate;
    let startDate = null;
    let modules : number ;
    let lectures = 0;
    let speakersIds = [];
    for (let i = 0; i < result.student_modules.length; i++) {
      if (i > 11) break;
      modules = i+1
      const module = result.student_modules[i];

      let speakerName: string;
      const topics = module.topics as unknown as any;
      lectures += topics.length;
      
      topics.forEach((topic) => {
        if (!speakersIds.includes(topic.speaker.id)) {
          moduleHtml.push(topic.speaker.name);
          speakersIds.push(topic.speaker.id);
        }
      });

      if (startDate == null) startDate = module.start_date;
      endDate = module.start_date;
    }
    const hours = lectures * 1.5;

    // // format end date
    // const newEndDate = new Date(endDate);
    // const endMonth = endDate.getMonth() + 1; // Add 1 because getMonth() returns zero-based index
    // const endYear = newEndDate.getFullYear() % 100; // Get last two digits of the year
    // const formattedEndDate = `${endMonth.toString().padStart(2, '0')}.${endYear.toString().padStart(2, '0')}`;

    // // format start date
    // const newStartDate = new Date(startDate);
    // const startMonth = endDate.getMonth() + 1; // Add 1 because getMonth() returns zero-based index
    // const startYear = newStartDate.getFullYear() % 100; // Get last two digits of the year
    // const formattedStartDate = `${startMonth.toString().padStart(2, '0')}.${startYear.toString().padStart(2, '0')}`;

    // format start date
    const newStartDate = this.formatMonthYear(new Date(startDate));
    // format end date
    const newEndDate = this.formatMonthYear(new Date(endDate));
    const certDate = this.formatDate(new Date(endDate));

    const completionInfo = `Completed the ${course.name} at NEXT MBA by Attending ${modules} modules ( ${lectures} lectures, ${hours} hours) and participating in the required assignments during the period between ${newStartDate} and ${newEndDate}.`;
    const attendanceInfo = `Attended the ${course.name} ( ${modules} modules/ ${lectures} lectures/ ${hours} hours) during period between ${newStartDate} and ${newEndDate}.`;

    let fontSize: string;
    if (studentInfo.name.length <= 24) fontSize = '60px';
    else if (studentInfo.name.length <= 29) fontSize = '50px';
    else fontSize = '42px';

    // add course name and speaker name
    const data = {
      courseName: courseName,
      name: studentInfo.name,
      nameFontSize: fontSize,
      modules: moduleHtml.join(', ') + '.',
      template: certificate.template,
      certificate_id: studCertificate.certificate_code,
      certificate_date: certDate,
      info: studCertificate.certificate_tier == 1 ? completionInfo : attendanceInfo,
    };

    const pdfBuffer = await this.pdfService.certificateGeneratePdf(htmlFilePath, data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');

    res.send(pdfBuffer);
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns zero-based index
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  formatMonthYear(date) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = monthNames[date.getMonth()].toUpperCase();
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
}
