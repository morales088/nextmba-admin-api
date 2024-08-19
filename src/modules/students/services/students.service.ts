import { BadRequestException, Injectable } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { HashService } from 'src/common/utils/hash.service';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';
import { StudentCoursesRepository } from '../repositories/student_courses.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';
import { FilterOptions } from '../interfaces/student.interface';
import { currentTime, last24Hours, previousEndOfDay, previousStartOfDay } from 'src/common/helpers/date.helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MailerLiteService } from '../../../common/mailerlite/mailerlite.service';
import { AccountType } from '../../../common/constants/enum';
import { SubscriberGroupV2 } from '../../../common/constants/groups';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly sendMailService: SendMailService,
    private readonly studentRepository: StudentRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly studentCoursesRepository: StudentCoursesRepository,
    private readonly mailerLiteService: MailerLiteService
  ) {}

  async getActiveStudentsCount() {
    return this.studentRepository.countAllActiveStudents();
  }

  async getAllStudentsCount() {
    return this.studentRepository.countAllStudents();
  }

  async getStudent(id: number) {
    return this.studentRepository.findById(id);
  }

  async getStudents(admin, search: string, filters, page: number = 1, per_page: number = 10) {
    return this.studentRepository.students(admin, search, filters, page, per_page);
  }

  async createStudent(data) {
    const password = data.password ?? this.generateRandomString(8);
    const hashedPassword = await this.hashService.hashPassword(password);

    const studentData = {
      ...data,
      password: hashedPassword,
      email: data.email.trim(),
    };

    const createdStudent = await this.studentRepository.insert(studentData);

    // send email credential if student is created
    if (createdStudent) {
      await this.sendMailService.emailLoginCredentials(createdStudent.email, password);
    }

    return createdStudent;
  }

  async createStudentTx(data) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const password = data.password ?? this.generateRandomString(8);
        const hashedPassword = await this.hashService.hashPassword(password);

        const studentData = {
          ...data,
          password: hashedPassword,
          email: data.email.trim(),
        };

        const existingStudent = await tx.students.findFirst({
          where: {
            email: {
              equals: studentData.email,
              mode: 'insensitive',
            },
          },
        });

        if (existingStudent) {
          throw new BadRequestException('Student already exists.');
        }

        const createdStudent = await tx.students.create({ data: studentData });

        // send email credential if student is created
        if (createdStudent) {
          await this.sendMailService.emailLoginCredentials(createdStudent.email, password);
        }

        return createdStudent;
      }, { timeout: 120000 });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateStudent(id: number, data) {
    const studentData = {
      ...data,
    };

    // insert student course if pro
    if (data.account_type === 2) {
      const courses = await this.studentCoursesRepository.activeCourses();
      const studCourses = await this.studentCoursesRepository.findByStudentId(id);

      for (const course of courses) {
        const checkCourse = studCourses.find((studCourse) => studCourse.course_id === course.id);
        if (checkCourse === undefined) {
          const startingDate = new Date();
          const expirationDate = new Date();
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
          const modulePerCourse = parseInt(process.env.MODULE_PER_COURSE);

          const studCourseData = {
            student_id: id,
            course_id: course.id,
            course_type: 2,
            module_quantity: modulePerCourse,
            starting_date: startingDate,
            expiration_date: expirationDate,
          };
          await this.createStudentCourse(studCourseData);
        }
      }
    }

    if (data.password) {
      const hashedPassword = await this.hashService.hashPassword(data.password);
      studentData.password = hashedPassword;
    }

    return this.studentRepository.updateStudent(id, studentData);
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  async getPayments(id: number) {
    return this.paymentRepository.findByStudentId(id);
  }

  async getCourses(id: number) {
    return this.studentCoursesRepository.findByStudentId(id);
  }

  async createStudentCourse(data) {
    const studentCourseData = {
      ...data,
    };

    return this.studentCoursesRepository.insert(studentCourseData);
  }

  async updateStudentCourse(id: number, data) {
    return this.studentCoursesRepository.updateStudentCourse(id, data);
  }

  async emailStudents() {
    const result = await this.studentRepository.studentEmail();
    const students = result as unknown as { id: number; email: string; email_sent: boolean }[];

    try {
      for (const student of students) {
        if (student.email_sent === false) {
          const password = this.generateRandomString(8);
          const hashedPassword = await this.hashService.hashPassword(password);

          const studentData = {
            password: hashedPassword,
            email_sent: true,
          };

          // send email credential to student
          console.error('sending credential to:', student.email);
          await this.sendMailService.emailLoginCredentials(student.email, password);
          // console.log(student.id, password, studentData);

          //update student
          await this.studentRepository.updateStudent(student.id, studentData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      return { error };
    } finally {
      return { message: 'Credentiats successfully sent to students' };
    }
  }

  async getStudentByEmail(email: string) {
    return this.studentRepository.findByEmail(email);
  }

  async getStudentsCreatedLast24Hours() {
    const twentyFourHoursAgo = last24Hours();

    const dateFilterOptions: FilterOptions = {
      field: 'createdAt',
      value: twentyFourHoursAgo,
      comparisonOperator: 'gte',
    };

    const students = await this.studentRepository.findStudentsByDateFilter(dateFilterOptions);

    return students;
  }

  async getExpiredCourseLast24Hours() {
    const currentDate = currentTime();
    const twentyFourHoursAgo = last24Hours();

    const student_courses = await this.studentCoursesRepository.findExpiredCourses(twentyFourHoursAgo, currentDate);

    return student_courses;
  }

  async getStudentsCompletedByDate() {
    try {
      const startDate = previousStartOfDay();
      const endDate = previousEndOfDay();

      const studentCourses = await this.studentCoursesRepository.findStudentCourses(endDate);

      // Filter out the completed student courses
      const completedStudentCourses = studentCourses
        .map((studentCourse) => {
          const studentCourseStartingDate = studentCourse.starting_date;

          // Filter out modules that are completed
          const filteredModules = studentCourse.course.modules.filter((module) => {
            // Filter modules after student course starts
            // Check if module status is [4 - Pending replay, 5 - Replay ]
            if (module.status === 4 || (module.status === 5 && studentCourseStartingDate <= module.start_date)) {
              // Filter active topics and visible to recordings
              const topic = module.topics.find((topic) => {
                return topic.status === 1 && topic.hide_recordings === false;
              });

              return topic !== undefined;
            }

            return false;
          });

          // Get the maximum end date of filtered modules
          const maxEndDate = filteredModules.reduce((maxDate, module) => {
            const moduleEndDate = new Date(module.end_date);
            return moduleEndDate > maxDate ? moduleEndDate : maxDate;
          }, new Date(0));

          // Update the course modules with the filtered modules
          const modifiedStudentCourse = {
            ...studentCourse.course,
            modules: filteredModules,
          };

          // Check if modules are exceeds or equal to course module length
          if (filteredModules.length >= studentCourse.course.module_length) {
            if (maxEndDate >= startDate && maxEndDate <= endDate) {
              return {
                ...studentCourse,
                course: modifiedStudentCourse,
              };
            }
          }

          return null; // Course not completed
        })
        .filter(Boolean);

      return completedStudentCourses;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addCreatedStudentToCourseGroups(studentId: number) {
    const student = await this.studentRepository.findById(studentId);
    const subscriber = await this.mailerLiteService.createOrUpdateSubscriber({ email: student.email });

    if (!subscriber) {
      console.debug(`Skipping student with invalid email: ${student.email}`);
      console.debug(`Unable to add student to group/list.`);
      return;
    }

    const { courseStartingDates, allSubscriberGroups } = await this.mailerLiteService.getAllSubscriberLists();
    const activeSubscribersGroup = Object.values(SubscriberGroupV2).map(group => group.active);
    const activeAndCourseGroupIds = [...allSubscriberGroups, ...activeSubscribersGroup];

    const studentCourses = await this.studentCoursesRepository.findByStudentId(studentId);

    for (const studentCourse of studentCourses) {
      const studentEmail = student.email
      const courseId = studentCourse.course_id;

      if (student.account_type === AccountType.PRO) {
        try {
          await this.mailerLiteService.assignSubscriberToGroups({
            email: studentEmail,
            fields: courseStartingDates,
            groups: activeAndCourseGroupIds,
          });
          console.log(`Student successfully added to all groups: ${studentEmail}`);
        } catch (error) {
          console.error('An error occurred:', error.message);
        }
      } else {
        const subscriberGroup = await this.mailerLiteService.getGroupByCourseId(courseId);
        const courseGroupActive = SubscriberGroupV2[courseId];

        if (!subscriberGroup) {
          console.debug(`Skipping student course ${courseId}, No data available.`);
          continue; // skip student course
        }

        const courseStartDate = studentCourse.starting_date;
        const courseStartDateField = { [`${subscriberGroup.start_date_field}`]: courseStartDate };

        try {
          await this.mailerLiteService.createOrUpdateSubscriber({
            email: studentEmail,
            fields: courseStartDateField,
          });

          const groupIds = [
            subscriberGroup.group_id, // Course group
            courseGroupActive.active, // Course active group
            SubscriberGroupV2[0].active, // Active students group
          ];

          await Promise.all(
            groupIds.map((groupId) =>
              this.mailerLiteService.assignSubscriberToGroup(subscriber.email, groupId)
            )
          );
        } catch (error) {
          console.error('An error occurred:', error.message);
        }
      }
      console.log(`Student successfully added to group(s): ${studentEmail}`);
    }
  }
}
