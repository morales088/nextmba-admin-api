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

  async payments(user, searchFilter: any, pageNumber: number = 1, perPage: number = 10): Promise<Payments[]> {
    const skipAmount = (pageNumber - 1) * perPage;
    const { search: searchData = null, product_code = null, start_date, end_date } = searchFilter;

    interface WhereCondition {
      OR?: any;
      AND?: any;
      NOT?: any;
      created_by?: any;
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
        { reference_id: { contains: searchData, mode: 'insensitive' } },
      ];
    }

    if (product_code) {
      whereCondition.OR = [{ product_code: { contains: product_code, mode: 'insensitive' } }];
    }

    if (start_date && end_date) {
      whereCondition.AND = [{ createdAt: { gte: start_date, lte: end_date } }];
    }

    if (user.role === 2) whereCondition.created_by = { in: [user.userId] };

    const payments = await this.prisma[this.modelName].findMany({
      where: whereCondition,
      include: { payment_items: true, product: true },
      orderBy: [
        {
          id: 'desc',
        },
      ],
      skip: skipAmount,
      take: perPage,
    });

    // const totalResult = await this.prisma[this.modelName].count({
    //   where: whereCondition,
    // });

    return payments;
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
    const createPaymentItems = await this.paymentItemRepository.insert(
      studentId,
      createPayment.id,
      data.product_code,
      data.origin
    );

    return await this.findById(createPayment.id);
  }

  async update(id: number, data): Promise<Payments> {
    const payment = await this.findById(id);

    if (!payment) {
      throw new BadRequestException('payment does not exist.');
    }

    return this.prisma[this.modelName].update({
      where: { id: id },
      data: data,
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({
      where: { id: id },
      include: { payment_items: true, product: true },
    });
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

  async findByReferenceId(referenceId: string) {
    if (!referenceId) return null;

    const payment = await this.prisma[this.modelName].findFirst({
      where: { reference_id: referenceId, status: 1 },
      include: { payment_items: true },
    });

    return payment;
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
      where: {
        student_id: studentId,
        status: 1,
        createdAt: { gte: giftableDate.toISOString() },
      },
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

  async studentPaymentInfo(id: number) {
    return this.prisma[this.modelName].findUnique({
      where: { id: id },
      include: { student: true, product: true },
    });
  }
}
