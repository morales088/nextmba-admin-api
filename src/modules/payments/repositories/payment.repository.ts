import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Payments } from '@prisma/client';
import { PaymentItemRepository } from './payment_item.repository';

@Injectable()
export class PaymentRepository extends AbstractRepository<Payments> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly paymentItemRepository: PaymentItemRepository
  ) {
    super(prisma);
  }

  get modelName(): string {
    return 'Payments'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Payments> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: { payment_items: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async payments(search: string = null, pageNumber: number = 1, perPage: number = 10): Promise<Payments> {
    const skipAmount = (pageNumber - 1) * perPage;
    const searchData = search ?? '';
    return this.prisma[this.modelName].findMany({
      where: {
        OR: [
          {
            email: {
              startsWith: searchData,
            },
          },
          { email: { endsWith: searchData } },
          // {
          //   name: {
          //     startsWith: searchData,
          //   },
          // },
          // { name: { endsWith: searchData } },
        ],
        status: 1,
      },
      include: { payment_items: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
      skip: skipAmount,
      take: perPage,
    });
  }

  async insert(studentId: number, productId: number, data: Partial<Payments>): Promise<any> {
    // insert payment
    const paymentData = {
      student_id: studentId,
      product_id: productId,
      ...data,
    };

    const createPayment = await this.prisma[this.modelName].create({ data: paymentData });

    // insert payment items
    const createPaymentItems = await this.paymentItemRepository.insert(studentId, createPayment.id, data.product_code);

    return await this.findById(createPayment.id);
  }

  //   async update(id: number, data): Promise<Payments> {
  //     const payment = await this.findById(id);

  //     if (!payment) {
  //       throw new BadRequestException('payment does not exist.');
  //     }

  //     return this.prisma[this.modelName].update({
  //       where: { id : id },
  //       data: data,
  //     });
  //   }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id: id }, include: { payment_items: true } });
  }

  async findByStudentId(id: number) {
    const payments = await this.prisma[this.modelName].findMany({
      where: { student_id: id, status: 1 },
      include: { payment_items: true },
    });

    // add product to payments
    for (const payment of payments) {
      const product = await this.prisma.products.findUnique({ where: { id: payment.product_id } });
      payment.product = product;
    }

    return payments;
  }

  async findByFromStudId(studentId: number): Promise<Payments> {
    return this.prisma[this.modelName].findMany({
      where: { from_student_id: studentId, status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async getGiftable(studentId: number) {
    const giftableDate = new Date(process.env.GIFTABLE_DATE);

    const gifts = await this.prisma[this.modelName].findMany({
      where: { student_id: studentId, status: 1, createdAt: { gte: giftableDate.toISOString() } },
      include: {
        payment_items: true,
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });

    let courses = [];
    for (const gift of gifts) {
      for (const item of gift.payment_items) {
        const course = await this.prisma.courses.findUnique({ where: { id: item.course_id } });
        item.course_name = course.name;
        item.owner = gift.email;
        courses.push(item);
      }
    }

    return courses;
  }
}
