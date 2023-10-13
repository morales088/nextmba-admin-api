import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Courses, Products } from '@prisma/client';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductItemRepository } from './product_item.repository';

@Injectable()
export class ProductRepository extends AbstractRepository<Products> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly productItemRepository: ProductItemRepository
  ) {
    super(prisma);
  }

  get modelName(): string {
    return 'Products'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Courses> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 }, include: { Product_items: true } });
  }

  async insert(data: CreateProductDto): Promise<Products> {
    const { product_items, ...productsData } = data; // remove product items to array

    const createProduct = await this.prisma[this.modelName].create({ data: productsData });

    for (const item of data.product_items) {
      const itemData = {
        product_id: createProduct.id,
        ...item,
      };
      const createProductItem = await this.productItemRepository.insert(itemData);
    }

    return this.prisma[this.modelName].findUnique({
      where: { id: createProduct.id },
      include: { Product_items: true },
    });
  }

  //   async updateCourse(id: number, data: UpdateCourseDto): Promise<Courses> {
  //     const course = await this.findById(id);

  //     if (!course) {
  //       throw new BadRequestException('Course does not exist.');
  //     }

  //     return this.prisma[this.modelName].update({
  //       where: { id : id },
  //       data: data,
  //     });
  //   }

  //   async findById(id: number) {
  //     return this.prisma[this.modelName].findUnique({ where: { id : id } });
  //   }
}
