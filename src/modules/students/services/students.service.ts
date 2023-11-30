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

  async getStudents(search : string, page: number, per_page: number) {
    return this.studentRepository.students(search, page, per_page);
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

    if (data.password) {
      const hashedPassword = await this.hashService.hashPassword(data.password);
      studentData.password = hashedPassword
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
}
