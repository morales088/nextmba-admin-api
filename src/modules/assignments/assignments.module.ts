import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './services/assignments.service';
import { AssignmentsRepository } from './repositories/assignments.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository]
})
export class AssignmentsModule {}
