import { Module } from '@nestjs/common';
import { AssignmentsController } from './controllers/assignments.controller';
import { AssignmentsService } from './services/assignments.service';
import { AssignmentsRepository } from './repositories/assignments.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { IndividualSubmmisionsRepository } from './repositories/individual-submissions.repository';
import { IndividualSubmissionsController } from './controllers/individual-submissions.controller';
import { IndividualSubmissionsService } from './services/individual-submissions.service';
import { StudentGroupsController } from './controllers/student-groups.controller';
import { StudentGroupService } from './services/student-group.service';
import { StudentGroupRepository } from './repositories/student-groups.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController, IndividualSubmissionsController, StudentGroupsController],
  providers: [
    AssignmentsService,
    IndividualSubmissionsService,
    AssignmentsRepository,
    IndividualSubmmisionsRepository,
    StudentGroupService,
    StudentGroupRepository,
  ],
})
export class AssignmentsModule {}
