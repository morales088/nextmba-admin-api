import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Gifts } from '@prisma/client';
import { UpdateGiftDto } from '../dto/update-gift.dto';

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

  async updateGift(id: number, data: UpdateGiftDto): Promise<any> {
    // const gift = await this.findById(id);

    // if (!gift || gift.status != 1) {
    //   throw new BadRequestException('Gift does not exist.');
    // }

    // update payment's giftable
    // const { gift_id, ...itemsData } = data; // remove gift_id items to array
    const updateGiftable = await this.prisma.payment_items.update({
      where: { id: id },
      data: { giftable: data.quantity },
    });

    return { message: 'Gift/giftable quantity successfully changed.' };
  }
}
