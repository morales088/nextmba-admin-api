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
import { StudentGroupsRepository } from './repositories/student-groups.repository';
import { StudentGroupMembersRepository } from './repositories/student-group-members.repository';
import { StudentCoursesRepository } from '../students/repositories/student_courses.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController, IndividualSubmissionsController, StudentGroupsController],
  providers: [
    AssignmentsService,
    IndividualSubmissionsService,
    AssignmentsRepository,
    IndividualSubmmisionsRepository,
    StudentGroupService,
    StudentGroupsRepository,
    StudentGroupMembersRepository,
    StudentCoursesRepository
  ],
})
export class AssignmentsModule {}
