import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './services/courses.service';
import { CourseRepository } from './repositories/course.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseRepository]
})
export class CoursesModule {}
