import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseRepository } from '../repositories/course.repository';
import { StudentCoursesRepository } from 'src/modules/students/repositories/student_courses.repository';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly studentCoursesRepository: StudentCoursesRepository
  ) {}

  async getCourse(id: number) {
    return this.courseRepository.findById(id);
  }

  async getCourses() {
    return this.courseRepository.find();
  }

  async createCourse(data) {
    return this.courseRepository.insert(data);
  }

  async updateCourse(id: number, data) {
    return this.courseRepository.updateCourse(id, data);
  }

  async getAllCourseStartingDates() {
    const activeCourses = await this.courseRepository.findAll();

    const startingDates = activeCourses
      .filter((course) => course.paid !== 0 && course.status !== 0)
      .reduce((acc, course) => {
        acc[course.id] = course.name;
        return acc;
      }, {});
    console.log('💡 ~ startingDates:', startingDates);

    return startingDates;
  }

  async getStudCourse(courseId: number, studId: number) {
    return this.studentCoursesRepository.findByStudCourse(courseId, studId);
  }
}
