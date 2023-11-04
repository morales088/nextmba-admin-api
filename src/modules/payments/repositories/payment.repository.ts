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
    return this.prisma[this.modelName].findMany({ where: { status: 1 }, include: { payment_items: true } });
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
}
