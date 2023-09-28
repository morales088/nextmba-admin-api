import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { AccountModule } from './modules/accounts/account.module';
import { AdminModule } from './modules/admins/admin.module';
import { CoursesModule } from './modules/courses/courses.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
