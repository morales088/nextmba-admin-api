import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Courses, Products } from '@prisma/client';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductItemRepository } from './product_item.repository';
import { UpdateProductDto } from '../dto/update-product.dto';

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

  async find(): Promise<Products> {
    return this.prisma[this.modelName].findMany({
      where: { status: 1 },
      include: { product_items: true },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    });
  }

  async insert(data: CreateProductDto): Promise<Products> {
    const productCode = await this.findByCode(data.code);

    if (productCode) {
      throw new BadRequestException('Product code already exist.');
    }

    const { product_items, ...productsData } = data; // remove product items to array

    const createProduct = await this.prisma[this.modelName].create({ data: productsData });

    for (const item of data.product_items) {
      const itemData = {
        product_id: createProduct.id,
        ...item,
      };

      await this.productItemRepository.insert(itemData);
    }

    return this.prisma[this.modelName].findUnique({
      where: { id: createProduct.id },
      include: { product_items: true },
    });
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<any> {
    const product = await this.findById(id);

    if (!product) {
      throw new BadRequestException('Product does not exist.');
    }

    if (data.code) {
      const productCode = await this.findByCode(data.code);

      if (productCode) {
        throw new BadRequestException('Product code already exist.');
      }
    }

    // update product
    const { product_items, ...productsData } = data; // remove product items to array
    const updateProduct = await this.prisma[this.modelName].update({
      where: { id: id },
      data: productsData,
    });

    // update product Item
    if (data.product_items) {
      for (const item of data.product_items) {
        // const { id, ...productItemData } = item; // remove id to array
        const productItem = await this.prisma.product_items.findFirst({
          where: { product_id: id, course_id: item.course_id },
        });

        if (productItem !== null) {
          await this.productItemRepository.update(productItem.id, item);
        } else {
          const itemData = {
            product_id: id,
            ...item,
          };
          await this.productItemRepository.insert(itemData);
        }
      }
    }
    return this.prisma[this.modelName].findUnique({
      where: { id: id },
      include: { product_items: true },
    });
  }

  async findById(id: number) {
    return this.prisma[this.modelName].findUnique({ where: { id: id }, include: { product_items: true } });
  }

  async findByCode(code: string) {
    return this.prisma.products.findFirst({
      where: { code: code, status: 1 },
      include: { product_items: true },
    });
  }

  async coursesPerProduct(code: string) {
    return this.prisma.$queryRaw`select c.name
    from "Products" p
    left join "Product_items" pi ON p.id = pi.product_id and pi.status = 1
    left join "Courses" c ON pi.course_id = c.id
    where p.code = ${code}`;
  }
}
