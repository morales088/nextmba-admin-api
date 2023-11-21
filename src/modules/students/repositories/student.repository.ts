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
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Students>): Promise<Students> {
    const existingStudent = await this.prisma[this.modelName].findUnique({ where: { email: data.email } });

    if (existingStudent) {
      throw new BadRequestException('Student already exists.');
    }

    return this.prisma[this.modelName].create({ data: data });
  }

  async updateStudent(id: number, data: UpdateStudentDto): Promise<Students> {
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
