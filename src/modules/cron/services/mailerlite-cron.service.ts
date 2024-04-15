import { Injectable, Logger } from '@nestjs/common';
import { StudentsService } from '../../students/services/students.service';
import { processAndRemoveEntries, processAndRemoveFirstEntry, saveToCSV } from '../../../common/helpers/csv.helper';
import { MailerLiteService } from 'src/common/mailerlite/mailerlite.service';
import { AccountStatus, AccountType } from 'src/common/constants/enum';
import { SubscriberGroupsService } from '../../subscriber_groups/services/subscriber-groups.service';
import validator from 'validator';

@Injectable()
export class MailerliteCronService {
  private readonly logger = new Logger(MailerliteCronService.name);

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

  async exportCompletedStudentsCourses() {
    const studentsCompleted = await this.studentService.getStudentsCompletedByDate();
    const studentsCompletedCourses = [];

    for (const studentCompleted of studentsCompleted) {
      const studentEmail = studentCompleted.student.email;
      const studentStatus = studentCompleted.student.status;
      const courseIdCompleted = studentCompleted.course_id;

      if (!validator.isEmail(studentEmail)) {
        this.logger.debug(`Skipping student with invalid email: ${studentEmail}`);
        continue;
      }

      studentsCompletedCourses.push({
        course_id: courseIdCompleted,
        student_email: studentEmail,
        student_status: studentStatus,
      });
    }

    await saveToCSV('students-completed-course.csv', studentsCompletedCourses);

    return studentsCompleted;
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

      if (!subscriber) {
        this.logger.debug(`Skipping student with invalid email: ${studentEmail}`);
        return;
      }

      const student = await this.studentService.getStudentByEmail(studentEmail);

      if (!student || !student.student_courses) {
        this.logger.debug(`Unable to process student courses.`);
        return;
      }

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

      if (!subscriber) {
        this.logger.debug(`Skipping student with invalid email: ${studentEmail}`);
        return;
      }

      const subscriberGroup = await this.subscriberGroupsService.getSubscriberGroupByCourseId(parseInt(courseId));

      if (!subscriberGroup) {
        this.logger.debug(`Skipping student course ${courseId}, No data available.`);
        return;
      }

      if (parseInt(studentStatus) === AccountStatus.ACTIVE) {
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

  async removeCompletedStudentsToGroups() {
    try {
      const rowsData = await processAndRemoveEntries('students-completed-course.csv', 10);

      if (!Array.isArray(rowsData) || rowsData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      for (const rowData of rowsData) {
        const [courseId, studentEmail, studentStatus] = rowData;

        const subscriber = await this.mailerLiteService.createOrUpdateSubscriber({ email: studentEmail });

        if (!subscriber) {
          this.logger.debug(`Skipping student with invalid email: ${studentEmail}`);
          continue;
        }

        const subscriberGroup = await this.subscriberGroupsService.getSubscriberGroupByCourseId(parseInt(courseId));

        if (!subscriberGroup) {
          this.logger.debug(`Skipping student course ${courseId}, No data available.`);
          continue;
        }

        if (parseInt(studentStatus) === AccountStatus.ACTIVE) {
          const result = await this.mailerLiteService.unAssignSubscriberToGroup(
            subscriber.id,
            subscriberGroup.group_id
          );

          if (result !== null) {
            this.logger.log(`Student successfully removed to group: ${studentEmail}`);
          } else {
            this.logger.log(`Student is not a member of the group: ${studentEmail}`);
          }
        } else {
          await this.mailerLiteService.removeSubscriber(subscriber.id);
          this.logger.log(`Removed from subscribers: ${studentEmail}`);
        }
      }
    } catch (error) {
      this.logger.error('An error occurred:', error.message);
    }
  }
}
