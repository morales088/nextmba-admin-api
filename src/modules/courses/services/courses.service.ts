import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseRepository } from '../repositories/course.repository';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository
  ) {}

  async getCourse(id:number) {
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
}
