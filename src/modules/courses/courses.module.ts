import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './services/courses.service';
import { CourseRepository } from './repositories/course.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AwsService } from 'src/common/aws/aws.service';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { StudentCoursesRepository } from '../students/repositories/student_courses.repository';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseRepository, AwsService, AwsS3Service, StudentCoursesRepository],
  exports: [CoursesService]
})
export class CoursesModule {}
