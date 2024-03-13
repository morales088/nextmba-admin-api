import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { StudentsService } from '../../students/services/students.service';
import { processAndRemoveFirstEntry, saveToCSV } from '../../../common/helpers/csv.helper';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';
import { courseGroupMapping } from '../helpers/course-group.helper';
import { AccountStatus, AccountType } from 'src/common/constants/enum';
import validator from 'validator';
import { CourseGroupService } from 'src/common/utils/course-group.service';
import { toString } from 'lodash';

@Injectable()
export class MailerliteCronService {
  private readonly logger = new Logger(MailerliteCronService.name);

  constructor(
    private readonly studentService: StudentsService,
    private readonly mailerLiteService: MailerLiteService,
    private readonly courseGroupService: CourseGroupService
  ) {}

  async exportStudentData() {
    const students = await this.studentService.getStudentsCreatedLast24Hours();
    const validStudents = [];

    for (const student of students) {
      if (!validator.isEmail(student.email)) {
        this.logger.debug(`Skipping student with invalid email: ${student.email}`);
        continue;
      }

      // If the email is valid, add the student info to validStudents array
      validStudents.push({
        email: student.email,
      });
    }

    await saveToCSV('students-to-add.csv', validStudents);

    return validStudents;
  }

  async exportExpiredStudentCourse() {
    const studentCourses = await this.studentService.getExpiredCourseLast24Hours();
    const expiredStudentCourses = [];

    for (const studentCourse of studentCourses) {
      const studentEmail = studentCourse.student.email;

      if (!validator.isEmail(studentEmail)) {
        this.logger.debug(`Skipping student with invalid email: ${studentEmail}`);
        continue;
      }

      // If the email is valid, add the student and course info to  expiredStudentCourses array
      expiredStudentCourses.push({
        course_id: studentCourse.course_id,
        student_email: studentEmail,
        student_status: studentCourse.student.status,
      });
    }

    await saveToCSV('students-to-remove.csv', expiredStudentCourses);

    return studentCourses;
  }

  async addStudentsToGroups() {
    try {
      await processAndRemoveFirstEntry('students-to-add.csv', async (firstRow) => {
        const [studentEmail] = firstRow;

        const subscriber = await this.mailerLiteService.addNewSubscriber({ email: studentEmail });

        const student = await this.studentService.getStudentByEmail(studentEmail);
        const studentCourses = student.student_courses;

        const allStudentGroups = Object.values(this.courseGroupService.getCourseGroupMapping()).map((values) =>
          values.toString()
        );

        if (student.status !== AccountStatus.INACTIVE) {
          // Check if student account type is pro account: then add to all student groups
          if (student.account_type === AccountType.PRO) {
            await this.mailerLiteService.assignSubscriberToGroups({ email: studentEmail, groups: allStudentGroups });
          } else {
            for (const studentCourse of studentCourses) {
              const courseId = toString(studentCourse.course_id);
              console.log("💡 ~ courseId:", courseId)
              const courseGroupId = toString(this.courseGroupService.getCourseGroupMapping()[courseId]);
              console.log("💡 ~ courseGroupId:", courseGroupId)

              await this.mailerLiteService.assignSubscriberToGroup(subscriber.id, courseGroupId);
            }
          }
          this.logger.log(`Student successfully added to group(s): ${studentEmail}`);
        } else {
          await this.mailerLiteService.removeSubscriber(subscriber.id);
          this.logger.verbose(`Removed from subscribers: ${studentEmail}`);
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeStudentsToGroups() {
    try {
      await processAndRemoveFirstEntry('students-to-remove.csv', async (firstRowData) => {
        // Process the first row here
        const [courseId, studentEmail, studentStatus] = firstRowData;

        const subscriber = await this.mailerLiteService.addNewSubscriber({ email: studentEmail });

        const courseGroupId = courseGroupMapping[courseId];

        if (studentStatus === AccountStatus.ACTIVE) {
          await this.mailerLiteService.unAssignSubscriberToGroup(subscriber.id, courseGroupId);
          this.logger.warn(`Student successfully removed to group: ${studentEmail}`);
        } else {
          await this.mailerLiteService.removeSubscriber(subscriber.id);
          this.logger.warn(`Removed from subscribers: ${studentEmail}`);
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
