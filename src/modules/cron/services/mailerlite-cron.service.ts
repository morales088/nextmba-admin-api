import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { StudentsService } from '../../students/services/students.service';
import { processAndRemoveFirstEntry, saveToCSV } from '../../../common/helpers/csv.helper';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';
// import { courseGroupMapping, courseStartDateKeyMapping } from '../helpers/course-group.helper';
import { AccountStatus, AccountType } from 'src/common/constants/enum';
import validator from 'validator';
import { toString } from 'lodash';
import { MailerliteMappingService } from 'src/common/mailerlite/mailerlite-mapping.service';
import { CoursesService } from 'src/modules/courses/services/courses.service';

@Injectable()
export class MailerliteCronService {
  private readonly logger = new Logger(MailerliteCronService.name);

  constructor(
    private readonly studentService: StudentsService,
    private readonly courseService: CoursesService,
    private readonly mailerLiteService: MailerLiteService,
    private readonly mailerliteMappingService: MailerliteMappingService
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

  async getCourseStartDateMappings() {
    const courseStartingDate = await this.courseService.getAllCourseStartingDates();
    const startDateFields = this.mailerliteMappingService.getMapping('startDateField');
    const subscriberGroups = Object.values(this.mailerliteMappingService.getMapping('subscriberGroup'));

    const mappedDates: { [key: string]: string } = {};

    for (const key in startDateFields) {
      if (courseStartingDate.hasOwnProperty(key)) {
        const field = startDateFields[key];
        mappedDates[field] = courseStartingDate[key];
      }
    }

    return { courseStartingDates: mappedDates, allSubscriberGroups: subscriberGroups };
  }

  async addStudentsToGroups() {
    try {
      await processAndRemoveFirstEntry('students-to-add.csv', async (firstRow) => {
        const [studentEmail] = firstRow;

        const subscriber = await this.mailerLiteService.createOrUpdateSubscriber({ email: studentEmail });

        const student = await this.studentService.getStudentByEmail(studentEmail);
        const studentCourses = student.student_courses;

        if (student.status !== AccountStatus.INACTIVE) {
          // Check if student account type is pro account: then add to all student groups
          if (student.account_type === AccountType.PRO) {
            const { courseStartingDates, allSubscriberGroups } = await this.getCourseStartDateMappings();

            await this.mailerLiteService.assignSubscriberToGroups({
              email: studentEmail,
              fields: courseStartingDates,
              groups: allSubscriberGroups,
            });

            this.logger.log(`Student successfully added to all groups: ${studentEmail}`);
          } else {
            for (const studentCourse of studentCourses) {
              const courseId = toString(studentCourse.course_id);
              const courseGroupId = this.mailerliteMappingService.getMapping('subscriberGroup')[courseId];

              const courseStartDate = studentCourse.starting_date;
              const startDateKeyName = this.mailerliteMappingService.getMapping('startDateField')[courseId];
              const courseStartDateField = { [`${startDateKeyName}`]: courseStartDate };

              await this.mailerLiteService.createOrUpdateSubscriber({
                email: studentEmail,
                fields: courseStartDateField,
              });

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
        const [courseId, studentEmail, studentStatus] = firstRowData;

        const subscriber = await this.mailerLiteService.createOrUpdateSubscriber({ email: studentEmail });

        const courseGroupId = this.mailerliteMappingService.getMapping('subscriberGroup')[courseId];

        if (studentStatus === AccountStatus.INACTIVE) {
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
