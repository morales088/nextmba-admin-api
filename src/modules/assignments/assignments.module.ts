import { Module } from '@nestjs/common';
import { AssignmentsController } from './controllers/assignments.controller';
import { AssignmentsService } from './services/assignments.service';
import { AssignmentsRepository } from './repositories/assignments.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { IndividualSubmmisionsRepository } from './repositories/idividual-submissions.repository';
import { IndividualSubmissionsController } from './controllers/individual-submissions.controller';
import { IndividualSubmissionsService } from './services/individual-submissions.service';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController, IndividualSubmissionsController],
  providers: [AssignmentsService, IndividualSubmissionsService, AssignmentsRepository, IndividualSubmmisionsRepository]
})
export class AssignmentsModule {}
