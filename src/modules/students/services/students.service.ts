import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { HashService } from 'src/common/utils/hash.service';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';
import { StudentCoursesRepository } from '../repositories/student_courses.repository';
import { SendMailService } from 'src/common/utils/send-mail.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly hashService: HashService,
    private readonly sendMailService: SendMailService,
    private readonly studentRepository: StudentRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly studentCoursesRepository: StudentCoursesRepository
  ) {}

  async getStudent(id: number) {
    return this.studentRepository.findById(id);
  }

  async getStudents(admin, search: string, filters, page: number, per_page: number) {
    return this.studentRepository.students(admin, search, filters, page, per_page);
  }

  async createStudent(data) {
    const password = data.password ?? this.generateRandomString(8);
    const hashedPassword = await this.hashService.hashPassword(password);

    const studentData = {
      ...data,
      password: hashedPassword,
    };

    const createdStudent = await this.studentRepository.insert(studentData);

    // send email credential if student is created
    if (createdStudent) {
      this.sendMailService.emailLoginCredentials(createdStudent.email, password);
    }

    return createdStudent;
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
    } finally {
      return { message: 'Credentiats successfully sent to students' };
    }
  }
}
