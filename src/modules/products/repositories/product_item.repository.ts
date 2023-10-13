import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Product_items } from '@prisma/client';
import { CreateItemDto } from '../dto/create-item.dto';

@Injectable()
export class ProductItemRepository extends AbstractRepository<Product_items> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'Product_items'; // Specify the Prisma model name for entity
  }

  async find(): Promise<Product_items> {
    return this.prisma[this.modelName].findMany({ where: { status: 1 } });
  }

  async insert(data:any): Promise<any> {

      try {
        return await this.prisma.product_items.create({ data });
      } catch (error) {
        return { success: false, error: error.message };
      }
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
