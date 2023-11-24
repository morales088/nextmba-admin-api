import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Gifts } from '@prisma/client';

@Injectable()
export class GiftRepository extends AbstractRepository<Gifts> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Gifts'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Gifts> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data: Partial<Gifts>): Promise<Gifts> {
    return this.prisma[this.modelName].create({ data: data });
  }

  //   async updateStudent(id: number, data: UpdateStudentDto): Promise<Students> {
  //     const student = await this.findById(id);

  //     if (!student) {
  //       throw new BadRequestException('Student does not exist.');
  //     }

  //     return this.prisma[this.modelName].update({
  //       where: { id: id },
  //       data: data,
  //     });
  //   }

  async getGift(paymentId: number, courseId: number) {
    return this.prisma[this.modelName].findMany({
      select: { recipient: true },
      where: { payment_id: paymentId, course_id: courseId, status: 1 },
    });
  }
}
