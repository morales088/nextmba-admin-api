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
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
