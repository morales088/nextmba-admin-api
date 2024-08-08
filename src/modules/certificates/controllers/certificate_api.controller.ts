import { Controller, Get, HttpStatus, Param, Query, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { PdfService } from 'src/common/utils/pdf.service';
import { StudentCertificatesService } from '../services/certificates.service';
import { Response } from 'express';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { CoursesService } from 'src/modules/courses/services/courses.service';
import { QrService } from '../services/qr.service';

@Controller('certificate-api')
// @UseGuards(ApiKeyGuard)
export class CertificateApiController {
  constructor(
    private readonly studentCertificatesService: StudentCertificatesService,
    private readonly coursesService: CoursesService,
    private readonly pdfService: PdfService,
    private readonly qrService: QrService
  ) {}

  @Get('/download/:studentCertificateCode')
  async generateCertificate(
    @Res() res: Response,
    @Param('studentCertificateCode') studentCertificateCode: string
  ): Promise<any> {
    const studCertificate = await this.studentCertificatesService.getCertificateByCode(studentCertificateCode);
    if (!studCertificate) throw new BadRequestException('Student certificate does not exist.');
    const studentInfo = studCertificate.student;

    const htmlFilePath = studCertificate.certificate_tier == 1 ? 'src/common/templates/course-certificate.template.html' : 'src/common/templates/module-certificate.template.html';

    let moduleHtml = [];
    const result = await this.studentCertificatesService.getPreviousModules(studentInfo.id, studCertificate.course_id);
    const certificate = await this.studentCertificatesService.getCertificate(studCertificate.certificate_tier);
    const course = await this.coursesService.getCourse(studCertificate.course_id);
    const courseName = course.name.split('+')[0];
    // const courseName = "AI For Business Course";

    // if(certificate && result.student_modules.length < 12) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Template not available. / Not yet complete the course.' });

    const moduleName = studCertificate.module?.name
    const moduleDate = this.formatMonthDayYear(studCertificate.module?.start_date)
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

    // format start date
    const newStartDate = this.formatMonthYear(new Date(startDate));
    // format end date
    const newEndDate = this.formatMonthYear(new Date(endDate));
    const certDate = this.formatDate(new Date(endDate));

    const completionInfo = `Completed the ${course.name} at NEXT MBA by Attending ${modules} modules ( ${lectures} lectures, ${hours} hours) and participating in the required assignments during the period between ${newStartDate} and ${newEndDate}.`;
    // const attendanceInfo = `Attended the ${course.name} ( ${modules} modules/ ${lectures} lectures/ ${hours} hours) during period between ${newStartDate} and ${newEndDate}.`;
    const attendanceInfo = `Attended a module entitled "<b>${moduleName}</b>" on ${moduleDate} and participated in its assignment as a presenter on ${newEndDate}.`;
    console.log(studCertificate.module?.topics)
    let speakers = await this.formatSpeakers(studCertificate.module?.topics)

    let nameSize: string;
    if (studentInfo.name.length <= 24) nameSize = '60px';
    else if (studentInfo.name.length <= 29) nameSize = '50px';
    else nameSize = '42px';

    let courseSize: string;
    if (courseName.length <= 20) courseSize = '58px';
    else if (courseName.length <= 29) courseSize = '46px';
    else courseSize = '40px';

    // QR
    const qrCodeDataUrl = await this.qrService.generateQrCode(studentCertificateCode,"#f0ede8");

    // add course name and speaker name
    const data = {
      courseName: courseName,
      courseFontSize: courseSize,
      name: studentInfo.name,
      nameFontSize: nameSize,
      modules: moduleHtml.join(', ') + '.',
      template: certificate.template,
      certificate_id: studCertificate.certificate_code,
      certificate_date: certDate,
      info: studCertificate.certificate_tier == 1 ? completionInfo : attendanceInfo,
      qr: qrCodeDataUrl,
      speakers : speakers
    };
    // console.log(data)
    
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
  
  formatMonthDayYear(dateString) {
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
  
    // Parse the date string to a Date object
    const date = new Date(dateString);
  
    // Get the month name, day, and year
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
  
    return `${month} ${day}, ${year}`;
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
  
  formatSpeakers(speakers: any[]): string {
    // Check for duplicate speaker IDs
    const seenIds = new Set<number>();
    const duplicates = new Set<number>();
    
    speakers.forEach(speaker => {
      if (seenIds.has(speaker.id)) {
        duplicates.add(speaker.id);
      } else {
        seenIds.add(speaker.id);
      }
    });

    const uniqueSpeakers = speakers.filter(speaker => !duplicates.has(speaker.id));

    return uniqueSpeakers
      .map(speaker => {
        const name = speaker.speaker.name;
        const description = speaker.speaker.description;
        return `<b>${name}</b> - ${description.replace(/<\/?[^>]+(>|$)/g, "")}`;
      })
      .join('<div style="line-height:80%;"><br></div>');
  }

  @Get('generate')
  async generateQrCode(@Query('text') text: string, @Res() res: Response) {
    const qrCodeDataUrl = await this.qrService.generateQrCode(text,"#f0ede8");
    const imgBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

    console.log(qrCodeDataUrl)
    res.setHeader('Content-Type', 'image/png');
    res.send(imgBuffer);
  }
}
