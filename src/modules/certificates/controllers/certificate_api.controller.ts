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
    // console.log(studCertificate)
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
    const attendanceInfo = `Attended a module entitled "<b>${moduleName}</b>" on ${moduleDate}, participated in its assignment and passed its quiz.`;
    // console.log(studCertificate.module?.topics)
    let speakers = studCertificate.module?.topics ? await this.formatLectures(studCertificate.module?.topics) : '';
    console.log(speakers)

    let nameSize: string;
    if (studentInfo.name.length <= 24) nameSize = '58px';
    else if (studentInfo.name.length <= 29) nameSize = '48px';
    else nameSize = '40px';

    let courseSize: string;
    if (courseName.length <= 20) courseSize = '58px';
    else if (courseName.length <= 29) courseSize = '46px';
    else courseSize = '40px';

    let speakerSize: string;
    if (studCertificate.module?.topics.length >= 4) speakerSize = '10px';
    else if (studCertificate.module?.topics.length <= 3) speakerSize = '12px';
    else speakerSize = '14px';

    // QR
    const qrCode = process.env.QR_FE_ROUTE+'/cert/'+studentCertificateCode
    const qrCodeDataUrl = await this.qrService.generateQrCode(qrCode,"#f0ede8");
    console.log(qrCode)

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
      speakers : speakers,
      speakerSize : speakerSize
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
  
    // return `${month} ${day}, ${year}`;
    return `${day} ${month} ${year}`;
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
    // // Check for duplicate speaker IDs
    // const seenIds = new Set<number>();
    // const duplicates = new Set<number>();
    
    // speakers.forEach(speaker => {
    //   if (seenIds.has(speaker.id)) {
    //     duplicates.add(speaker.id);
    //   } else {
    //     seenIds.add(speaker.id);
    //   }
    // });

    // const uniqueSpeakers = speakers.filter(speaker => !duplicates.has(speaker.id));
    const uniqueSpeakers = speakers;

    return uniqueSpeakers
      .map(speaker => {
        const name = speaker.speaker.name;
        const bio = speaker.speaker.bio;
        return `<b>${name}</b> - ${bio}`;
      })
      .join('<div style="line-height:60%;"><br></div>');
  }

  formatLectures(speakers: any[]) {

  let monthlyTalk = "<h1>Monthly talk:</h1>";
  let appliedStudies = "";

  let hasAppliedStudies = false;

  speakers.forEach(lecture => {
    const { type, speaker } = lecture;
    const bio = speaker.bio ? speaker.bio : '';

    if (type === 1) {
      monthlyTalk += `<h2><b>${speaker.name}</b> - ${bio}</h2>`;
    } else if (type === 4) {
      hasAppliedStudies = true;
      appliedStudies += `<h2><b>${speaker.name}</b> - ${bio}<br></h2>`;
    }
  });
  
  return hasAppliedStudies
    ? `${monthlyTalk}<br><h1>Applied Studies:</h1>${appliedStudies}`
    : monthlyTalk;
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
