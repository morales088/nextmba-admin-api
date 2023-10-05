import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Courses } from '@prisma/client';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CourseRepository extends AbstractRepository<Courses> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Courses'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Courses> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Courses>): Promise<Courses> {
    return this.prisma[this.modelName].create({ data });
  }

  async updateCourse(id: number, data: UpdateCourseDto): Promise<Courses> {
    const course = await this.findById(id);
    
    if (!course) {
      throw new BadRequestException('Course does not exist.');
    }
    
    return this.prisma[this.modelName].update({
      where: { id : id },
      data: data,
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id : id } });
  }
}
