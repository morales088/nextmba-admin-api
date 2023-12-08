import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Students } from '@prisma/client';
import { UpdateStudentDto } from '../dto/update-student.dto';

@Injectable()
export class StudentRepository extends AbstractRepository<Students> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Students'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Students> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
  }
  async students(
    admin,
    search: string = null,
    filters,
    pageNumber: number = 1,
    perPage: number = 10
  ): Promise<Students> {
    const skipAmount = (pageNumber - 1) * perPage;
    const searchData = search ?? '';

    let whereCondition = {
      OR: [
        {
          email: {
            startsWith: searchData,
            mode: 'insensitive',
          },
        },
        {
          email: {
            endsWith: searchData,
            mode: 'insensitive',
          },
        },
        {
          name: {
            startsWith: searchData,
            mode: 'insensitive',
          },
        },
        {
          name: {
            endsWith: searchData,
            mode: 'insensitive',
          },
        },
        {
          country: {
            contains: filters.country,
            mode: 'insensitive',
          },
        },
        {
          company: {
            contains: filters.company,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: filters.phone,
            mode: 'insensitive',
          },
        },
        {
          position: {
            contains: filters.position,
            mode: 'insensitive',
          },
        },
      ],
      created_by: {},
      student_courses: {},
    };

    if (filters.enrolled_to) whereCondition.student_courses = { some: { course_id: filters.enrolled_to } };
    if (filters.not_enrolled_to)
      whereCondition.student_courses = { some: {}, none: { course_id: filters.not_enrolled_to } };
    if (admin.role === 2) whereCondition.created_by = { in: [admin.id] };

    return this.prisma[this.modelName].findMany({
      where: whereCondition,
      include: { student_courses: { where: { status: 1 } } },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      skip: skipAmount,
      take: perPage,
    });
  }

  async insert(data: Partial<Students>): Promise<Students> {
    const existingStudent = await this.prisma[this.modelName].findUnique({ where: { email: data.email } });

    if (existingStudent) {
      throw new BadRequestException('Student already exists.');
    }

    return this.prisma[this.modelName].create({ data: data });
  }

  async updateStudent(id: number, data): Promise<Students> {
    const student = await this.findById(id);

    if (!student) {
      throw new BadRequestException('Student does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return this.prisma[this.modelName].findUnique({
      where: { email: email },
      include: { student_courses: { where: { status: 1 } } },
    });
  }
}
