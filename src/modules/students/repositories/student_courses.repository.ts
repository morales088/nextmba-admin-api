import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Prisma, Student_courses } from '@prisma/client';
import { UpdateStudentDto } from '../dto/update-student.dto';

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

  async findByCourse(courseId: number): Promise<Student_courses[]> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1, course_id: courseId },
      include: { student: true },
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
      throw new BadRequestException(`Course don't exists.`);
    }

    const studCourse = await this.prisma[this.modelName].create({ data: data });

    return await this.findById(studCourse.id);
  }

  async update(id: number, data: UpdateStudentDto): Promise<Student_courses> {
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
          gte: expiredDate,
          lte: currentDate,
        },
      },
      include: { course: true, student: true },
    });
  }

  async findStudentCourses(queryDate: Date) {
    try {
      const chunkSize = 5000;
      const studentCourses = await this.prisma.$transaction(
        async (tx) => {
          const courses: any[] = [];

          let offset = 0;
          while (true) {
            const chunkCourses = await tx[this.modelName].findMany({
              where: {
                expiration_date: { gte: queryDate },
                status: 1,
              },
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                  },
                },
                course: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    paid: true,
                    is_displayed: true,
                    module_length: true,
                    starting_date: true,
                    status: true,
                    modules: {
                      select: {
                        id: true,
                        course_id: true,
                        name: true,
                        start_date: true,
                        end_date: true,
                        tier: true,
                        status: true,
                        topics: {
                          select: {
                            id: true,
                            module_id: true,
                            speaker_id: true,
                            type: true,
                            publish: true,
                            status: true,
                            hide_recordings: true,
                            featured_lecture: true,
                          },
                        },
                      },
                      orderBy: {
                        end_date: 'desc',
                      },
                    },
                  },
                },
              },
              skip: offset,
              take: chunkSize,
              orderBy: {
                id: 'desc',
              },
            });

            if (chunkCourses.length === 0) {
              break;
            }

            courses.push(...chunkCourses);
            offset += chunkSize;
          }

          return courses;
        },
        {
          timeout: 600000, // 5 minutes
        }
      );

      return studentCourses;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findByStudCourse(courseId: number, studId: number): Promise<Student_courses> {
    return this.prisma[this.modelName].findFirst({
      where: { status: 1, course_id: courseId, student_id: studId },
    });
  }
}
