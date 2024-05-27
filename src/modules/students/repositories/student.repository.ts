import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Students } from '@prisma/client';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { FilterOptions } from '../interfaces/student.interface';

@Injectable()
export class StudentRepository extends AbstractRepository<Students> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Students'; // Specify the Prisma model name for entity
  }

  async countAllStudents(): Promise<number> {
    return this.prisma.students.count({
      where: { status: 1 },
    });
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

  async studentEmail(): Promise<Students> {
    return this.prisma[this.modelName].findMany({
      where: { email_sent: false, status: 1 },
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
  ): Promise<Students[]> {
    const skipAmount = (pageNumber - 1) * perPage;
    const searchData = search ?? '';

    interface WhereCondition {
      OR?: any;
      NOT?: any;
      created_by?: any;
      student_courses?: any;
      country?: string;
      company?: string;
      phone?: string;
      position?: string;
    }

    let whereCondition: WhereCondition = {};

    if (searchData)
      whereCondition.OR = [
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
      ];
    if (filters.country) whereCondition.country = filters.country;
    if (filters.company) whereCondition.company = filters.company;
    if (filters.phone) whereCondition.phone = filters.phone;
    if (filters.position) whereCondition.position = filters.position;

    if (filters.enrolled_to) {
      whereCondition.student_courses = { every: { course_id: filters.enrolled_to } };
      // whereCondition.student_courses = { some: { course_id: { in: JSON.parse(filters.enrolled_to) } } };
      if(filters.course_tier)
      whereCondition.student_courses = { every: { course_id: filters.enrolled_to, course_tier: filters.course_tier } };
    }

    if (filters.not_enrolled_to)
      whereCondition.NOT = [{ student_courses: { some: { course_id: filters.not_enrolled_to } } }];
    // whereCondition.NOT = [{ student_courses: { some: { course_id: { in: JSON.parse(filters.not_enrolled_to) } } } }];

    if (admin.role === 2) whereCondition.created_by = { in: [admin.userId] };

    console.log("💡 ~ whereCondition:", whereCondition)
    console.log("💡 ~ skipAmount:", skipAmount)
    console.log("💡 ~ perPage:", perPage)
    return this.prisma[this.modelName].findMany({
      where: whereCondition,
      include: { student_courses: { where: { status: 1 }, include: { course: true } } },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      skip: skipAmount,
      take: perPage,
    });
  }

  async insert(data: Partial<Students>): Promise<any> {
    const existingStudent = await this.prisma[this.modelName].findFirst({
      where: {
        email: {
          equals: data.email,
          mode: 'insensitive',
        },
      },
    });

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
    return this.prisma[this.modelName].findFirst({
      where: { email: { contains: email, mode: 'insensitive' } },
      include: { student_courses: { where: { status: 1 } } },
    });
  }

  async findStudentsByDateFilter(options: FilterOptions) {
    const { field, value, comparisonOperator } = options;
    const whereCondition = {};

    if (field && value && comparisonOperator) {
      whereCondition[field] = {
        [comparisonOperator]: value,
      };
    } else {
      throw new InternalServerErrorException('Invalid filter options.');
    }

    return this.prisma[this.modelName].findMany({
      where: whereCondition,
      include: { student_courses: { include: { course: true } } },
    });
  }
}
