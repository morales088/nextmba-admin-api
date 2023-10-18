import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './services/students.service';
import { StudentRepository } from './repositories/student.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { HashService } from 'src/common/utils/hash.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [StudentsService,StudentRepository, HashService]
})
export class StudentsModule {}
