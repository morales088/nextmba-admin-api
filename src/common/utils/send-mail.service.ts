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

    const templateData = {
      username: email,
      password: password,
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

    const templateData = {
      productCode: paymentInfo.product_code,
      paymentAmount: paymentInfo.price,
      paymentDate: paymentInfo.createdAt,
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
}
