import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Student_courses, Students } from '@prisma/client';
import { UpdateStudentDto } from '../dto/update-student.dto';

@Injectable()
export class StudentCoursesRepository extends AbstractRepository<Student_courses> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Student_courses'; // Specify the Prisma model name for entity
  }

  //   async find(): Promise<Student_courses> {
  //     return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  //   }

  async insert(data: Partial<Student_courses>): Promise<Student_courses> {
    const existingStudent = await this.prisma[this.modelName].findFirst({
      where: { course_id: data.course_id, student_id: data.student_id, status: 1 },
    });

    if (existingStudent) {
      throw new BadRequestException('Student course already exists.');
    }

    return this.prisma[this.modelName].create({ data: data });
  }

  async updateStudentCourse(id: number, data: UpdateStudentDto): Promise<Student_courses> {
    const student = await this.findById(id);

    if (!student) {
      throw new BadRequestException('Student course does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id: id } });
  }

  async findByStudentId(id: number) {
    const studCourses = await this.prisma[this.modelName].findMany({
      where: { student_id: id, status: 1 },
      include: {},
    });

    // add product to payments
    for (const studCourse of studCourses) {
      const course = await this.prisma.courses.findUnique({ where: { id: studCourse.course_id } });
      studCourse.course = course;
    }

    return studCourses;
  }
}
