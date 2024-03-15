import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseRepository } from '../repositories/course.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

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
    console.log("💡 ~ startingDates:", startingDates)

    return startingDates;
  }
}
