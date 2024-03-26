import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { StudentsService } from '../../students/services/students.service';
import { processAndRemoveFirstEntry, saveToCSV } from '../../../common/helpers/csv.helper';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';
import { AccountStatus, AccountType } from 'src/common/constants/enum';
import { SubscriberGroupsService } from '../../subscriber_groups/services/subscriber-groups.service';
import validator from 'validator';

@Injectable()
export class MailerliteCronService {
  private readonly logger = new Logger(MailerliteCronService.name);

  constructor(
    private readonly studentService: StudentsService,
    private readonly mailerLiteService: MailerLiteService,
    private readonly subscriberGroupsService: SubscriberGroupsService
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
      const firstRowData = await processAndRemoveFirstEntry('students-to-add.csv');

      if (!Array.isArray(firstRowData) || firstRowData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      const [studentEmail] = firstRowData;

      const subscriber = await this.mailerLiteService.createOrUpdateSubscriber({ email: studentEmail });

      const student = await this.studentService.getStudentByEmail(studentEmail);
      const studentCourses = student.student_courses;

      const { courseStartingDates, allSubscriberGroups } = await this.subscriberGroupsService.getAllSubscriberGroups();

      if (student.status !== AccountStatus.INACTIVE) {
        // Check if student account type is pro account: then add to all student groups
        if (student.account_type === AccountType.PRO) {
          await this.mailerLiteService.assignSubscriberToGroups({
            email: studentEmail,
            fields: courseStartingDates,
            groups: allSubscriberGroups,
          });

          this.logger.log(`Student successfully added to all groups: ${studentEmail}`);
        } else {
          for (const studentCourse of studentCourses) {
            const courseId = studentCourse.course_id;

            const subscriberGroup = await this.subscriberGroupsService.getSubscriberGroupByCourseId(courseId);

            if (!subscriberGroup) {
              this.logger.debug(`Skipping student course ${courseId}, No data available.`);
              continue;
            }

            const courseStartDate = studentCourse.starting_date;
            const courseStartDateField = { [`${subscriberGroup.start_date_field}`]: courseStartDate };

            await this.mailerLiteService.createOrUpdateSubscriber({
              email: studentEmail,
              fields: courseStartDateField,
            });

            await this.mailerLiteService.assignSubscriberToGroup(subscriber.id, subscriberGroup.group_id);
          }
          this.logger.log(`Student successfully added to group(s): ${studentEmail}`);
        }
      } else {
        await this.mailerLiteService.removeSubscriber(subscriber.id);
        this.logger.log(`Removed from subscribers: ${studentEmail}`);
      }
    } catch (error) {
      this.logger.error('An error occurred:', error.message);
    }
  }

  async removeStudentsToGroups() {
    try {
      const firstRowData = await processAndRemoveFirstEntry('students-to-remove.csv');

      if (!Array.isArray(firstRowData) || firstRowData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      const [courseId, studentEmail, studentStatus] = firstRowData;

      const subscriber = await this.mailerLiteService.createOrUpdateSubscriber({ email: studentEmail });

      const subscriberGroup = await this.subscriberGroupsService.getSubscriberGroupByCourseId(Number(courseId));

      if (!subscriberGroup) {
        this.logger.debug(`Skipping student course ${courseId}, No data available.`);
        return;
      }

      if (studentStatus === AccountStatus.INACTIVE) {
        await this.mailerLiteService.unAssignSubscriberToGroup(subscriber.id, subscriberGroup.group_id);
        this.logger.log(`Student successfully removed to group: ${studentEmail}`);
      } else {
        await this.mailerLiteService.removeSubscriber(subscriber.id);
        this.logger.log(`Removed from subscribers: ${studentEmail}`);
      }
    } catch (error) {
      this.logger.error('An error occurred:', error.message);
    }
  }
}
