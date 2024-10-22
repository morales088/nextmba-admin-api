import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Students, Prisma } from '@prisma/client';
import { FilterOptions } from '../interfaces/student.interface';

@Injectable()
export class StudentRepository {
  constructor(protected readonly prisma: PrismaService) {}

  async countAllActiveStudents(): Promise<number> {
    return this.prisma.students.count({
      where: { status: 1 },
    });
  }

  async countAllStudents(): Promise<number> {
    return this.prisma.students.count();
  }

  async find(): Promise<Students[]> {
    return this.prisma.students.findMany({
      where: { status: 1 },
      orderBy: [{ id: 'desc' }],
    });
  }

  async studentEmail(): Promise<Students[]> {
    return this.prisma.students.findMany({
      where: { email_sent: false, status: 1 },
      orderBy: [{ id: 'desc' }],
    });
  }

  async students(
    admin,
    search: string = null,
    filters,
    pageNumber: number = 1,
    perPage: number = 10
  ): Promise<{ students: Students[]; totalResult: number }> {
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

    if (searchData) {
      whereCondition.OR = [
        { email: { contains: searchData, mode: 'insensitive' } },
        { email: { startsWith: searchData, mode: 'insensitive' } },
        { email: { endsWith: searchData, mode: 'insensitive' } },
        { name: { contains: searchData, mode: 'insensitive' } },
        { name: { startsWith: searchData, mode: 'insensitive' } },
        { name: { endsWith: searchData, mode: 'insensitive' } },
      ];
    }

    if (filters.country) whereCondition.country = filters.country;
    if (filters.company) whereCondition.company = filters.company;
    if (filters.phone) whereCondition.phone = filters.phone;
    if (filters.position) whereCondition.position = filters.position;

    if (filters.enrolled_to) {
      whereCondition.student_courses = { some: { course_id: filters.enrolled_to } };
      // whereCondition.student_courses = { some: { course_id: { in: JSON.parse(filters.enrolled_to) } } };
      if (filters.course_tier)
        whereCondition.student_courses = { some: { course_id: filters.enrolled_to, course_tier: filters.course_tier } };
    }

    if (filters.not_enrolled_to)
      whereCondition.NOT = [{ student_courses: { some: { course_id: filters.not_enrolled_to } } }];
    // whereCondition.NOT = [{ student_courses: { some: { course_id: { in: JSON.parse(filters.not_enrolled_to) } } } }];

    // Student Course: start_date filter
    if (filters.start_date && filters.end_date) {
      whereCondition.OR = [
        {
          student_courses: {
            some: {
              course_id: filters.enrolled_to,
              starting_date: {
                gte: filters.start_date,
                lte: filters.end_date,
              },
            },
          },
        },
      ];
    }

    if (admin.role === 2) whereCondition.created_by = { in: [admin.userId] };

    const students = await this.prisma.students.findMany({
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

    // Fetch total count of matching students
    const totalResult = await this.prisma.students.count({
      where: whereCondition,
    });

    return { students, totalResult };
  }

  async insert(data: Prisma.StudentsCreateInput): Promise<Students> {
    return this.prisma.students.create({ data });
  }

  async update(id: number, data: Prisma.StudentsUpdateInput): Promise<Students> {
    return this.prisma.students.update({
      where: { id },
      data: data,
    });
  }

  async findById(id: number) {
    const student = await this.prisma.students.findUnique({ where: { id } });

    if (!student) throw new NotFoundException('Student not found.');

    return student;
  }

  async findByEmail(email: string) {
    return this.prisma.students.findFirst({
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

    return this.prisma.students.findMany({
      where: whereCondition,
      include: { student_courses: { include: { course: true } } },
    });
  }
}
