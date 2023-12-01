import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Product_items } from '@prisma/client';

@Injectable()
export class ProductItemRepository extends AbstractRepository<Product_items> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Product_items'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Product_items> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: any): Promise<any> {
    try {
      return await this.prisma[this.modelName].create({ data });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(id: number, data: any): Promise<any> {
    const productItem = await this.findById(id);

    if (!productItem) {
      throw new BadRequestException('product item does not exist.');
    }
    await this.prisma.product_items.update({
      where: { id: id },
      data: data,
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id: id } });
  }
}
