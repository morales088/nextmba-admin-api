import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import handlebars from 'handlebars';

@Injectable()
export class SendMailService {
  constructor(private readonly mailerService: MailerService) {}

  async emailLoginCredentials(email: string, password: string) {
    const emailTemplate = fs.readFileSync('src/common/templates/credential.template.html', 'utf-8');
    const template = handlebars.compile(emailTemplate);
    const link = process.env.STUDENT_ROUTE

    const templateData = {
      username: email,
      password: password,
      link: link,
    };

    const emailContent = template(templateData);

    const recipients = [email, process.env.ADMIN_EMAIL_ADDRESS];

    await this.mailerService.sendMail({
      to: recipients,
      subject: 'Credentials',
      html: emailContent,
    });
  }

  async emailPaymentInformation(paymentInfo: any) {
    const emailTemplate = fs.readFileSync('src/common/templates/payment-information.template.html', 'utf-8');
    const template = handlebars.compile(emailTemplate);

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // timeZoneName: 'short',
    };
    
    const formattedDate = paymentInfo.createdAt.toLocaleDateString('en-US', options);

    const templateData = {
      // productCode: paymentInfo.product_code,
      name: this.capitalizeFirstLetter(paymentInfo.name),
      username: paymentInfo.email,
      productName: paymentInfo.productName,
      country: paymentInfo.country,
      paymentAmount: paymentInfo.price,
      paymentDate: formattedDate,
      referenceNumber: paymentInfo.reference_id ?? '',
      contactNumber: paymentInfo.contact_number ?? '',
      quantity: 1,
      amount: paymentInfo.price * 1,
    };
    
    const emailContent = template(templateData);

    const recipients = [ paymentInfo.email, process.env.PAYMENT_INFO_RECIPIENT]

    await this.mailerService.sendMail({
      to: recipients,
      subject: 'Payment Information',
      html: emailContent,
    });
  }

  async emailGiftInformation(email: string, recipient: string, courseName: string) {
    const emailTemplate = fs.readFileSync('src/common/templates/gift.template.html', 'utf-8');
    const template = handlebars.compile(emailTemplate);
    const link = process.env.STUDENT_ROUTE

    const templateData = {
      recipient: recipient,
      courseName: courseName,
      link: link,
    };

    const emailContent = template(templateData);

    const recipients = [email, process.env.ADMIN_EMAIL_ADDRESS];

    await this.mailerService.sendMail({
      to: recipients,
      subject: 'Gifted Course',
      html: emailContent,
    });
  }

  async emailCourseInformation(studentEmail:string, courseInfo: any) {
    const emailTemplate = fs.readFileSync('src/common/templates/course-access.template.html', 'utf-8');
    const template = handlebars.compile(emailTemplate);
    const link = process.env.STUDENT_ROUTE

    const templateData = {
      student: courseInfo.student,
      courses: courseInfo.courses,
      link: link,
    };
    
    const emailContent = template(templateData);

    const recipients = [ studentEmail, process.env.PAYMENT_INFO_RECIPIENT]

    await this.mailerService.sendMail({
      to: recipients,
      subject: 'Course Information',
      html: emailContent,
    });
  }

  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
