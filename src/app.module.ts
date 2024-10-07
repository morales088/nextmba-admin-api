import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { AccountModule } from './modules/accounts/account.module';
import { AdminModule } from './modules/admins/admin.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ModulesModule } from './modules/modules/modules.module';
import { SpeakersModule } from './modules/speakers/speakers.module';
import { TranslationsModule } from './modules/translations/translations.module';
import { TopicsModule } from './modules/topics/topics.module';
import { FilesModule } from './modules/files/files.module';
import { MediasModule } from './modules/medias/medias.module';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StudentsModule } from './modules/students/students.module';
import { AwsService } from './common/aws/aws.service';
import { AwsS3Service } from './common/aws/aws_s3.service';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { AppliedStudiesModule } from './modules/applied_studies/applied_studies.module';
import { BillingsModule } from './modules/billings/billings.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { MailerliteModule } from './common/mailerlite/mailerlite.module';
import { SubscriberGroupsModule } from './modules/subscriber_groups/subscriber-groups.module';
import { GoogleModule } from './common/google/google.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import * as dotenv from 'dotenv';
// import { CronModule } from './modules/cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QuizModule } from './modules/quiz/quiz.module';
import { WebhookModule } from './modules/webhooks/webhook.module';
import { StudentPlanModule } from './modules/student-plan/student-plan.module';
import { StripeModule } from './modules/stripe/stripe.module';

dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
    }),
    AuthModule,
    UserModule,
    CloudinaryModule,
    AccountModule,
    AdminModule,
    CoursesModule,
    ModulesModule,
    SpeakersModule,
    TranslationsModule,
    TopicsModule,
    FilesModule,
    MediasModule,
    ProductsModule,
    PaymentsModule,
    StudentsModule,
    AffiliatesModule,
    GiftsModule,
    MeetingsModule,
    AppliedStudiesModule,
    BillingsModule,
    CertificatesModule,
    MailerliteModule,
    SubscriberGroupsModule,
    GoogleModule,
    AssignmentsModule,
    // CronModule,
    QuizModule,
    WebhookModule,
    StudentPlanModule,
    StripeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
