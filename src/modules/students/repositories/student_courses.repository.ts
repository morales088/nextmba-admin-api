import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Prisma, Student_courses, Students } from '@prisma/client';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { FilterOptions } from '../interfaces/student.interface';

@Injectable()
export class StudentCoursesRepository extends AbstractRepository<Student_courses> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Student_courses'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Student_courses> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: { course: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: Partial<Student_courses>): Promise<Student_courses> {
    const existingStudent = await this.prisma[this.modelName].findFirst({
      where: { course_id: data.course_id, student_id: data.student_id, status: 1 },
    });

    if (existingStudent) {
      throw new BadRequestException('Student course already exists.');
    }

    const courseExist = await this.prisma.courses.findMany({ where: { id: data.course_id, status: 1 } });
    if (courseExist.length === 0) {
      throw new BadRequestException('Course dont exists.');
    }

    const studCourse = await this.prisma[this.modelName].create({ data: data });
    return await this.findById(studCourse.id);
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
    return this.prisma[this.modelName].findUnique({ where: { id: id }, include: { course: true } });
  }

  async findByStudentId(id: number) {
    const studCourses = await this.prisma[this.modelName].findMany({
      where: { student_id: id, status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });

    // add product to payments
    for (const studCourse of studCourses) {
      const course = await this.prisma.courses.findUnique({ where: { id: studCourse.course_id } });
      studCourse.course = course;
    }

    return studCourses;
  }

  async activeCourses() {
    return this.prisma.courses.findMany({
      where: { is_displayed: 1, paid: 1, status: 1 },
      orderBy: { id: 'asc' },
    });
  }

  async findExpiredCourses(expiredDate: Date, currentDate: Date) {
    return this.prisma[this.modelName].findMany({
      where: {
        status: 0,
        expiration_date: {
          gt: expiredDate,
          lt: currentDate,
        },
      },
      include: { course: true, student: true },
    });
  }

  async findStudentCompletedModules() {
    const currentDate = new Date();
    console.log('💡 ~ currentDate:', currentDate);

    const completedCourses: any = await this.prisma.$queryRaw`
      SELECT sc.student_id, 
        c.id course_id, 
        count(m.id) AS number_of_modules 
        -- max(m.end_date) AS max_end_date_of_12th_module
      FROM "Modules" AS m
      LEFT JOIN "Courses" AS c ON m.course_id = c.id
      LEFT JOIN "Student_courses" AS sc ON sc.course_id = c.id
      WHERE m.status IN (4,5) 
        AND c.is_displayed = 1 
        AND c.status <> 0 
        AND sc.status <> 0 
        AND sc.starting_date <= m.start_date
      GROUP BY sc.student_id, c.id 
      HAVING COUNT(m.id) >= 12 
      ORDER BY sc.student_id;
    `;

    // Convert BigInt values
    const completedCoursesMapped = completedCourses.map((course) => ({
      student_id: Number(course.student_id),
      course_id: Number(course.course_id),
      number_of_modules: String(course.number_of_modules),
      max_start_date_of_12th_module: course.max_start_date_of_12th_module,
    }));
    console.log('💡 ~ completedCoursesMapped:', completedCoursesMapped.length);

    return completedCoursesMapped;
  }
}
