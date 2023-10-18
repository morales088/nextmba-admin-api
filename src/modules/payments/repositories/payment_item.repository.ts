import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractRepository } from 'src/common/repositories/abstract.repository';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Payment_items, Payments } from '@prisma/client';

@Injectable()
export class PaymentItemRepository extends AbstractRepository<Payment_items> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  get modelName(): string {
    return 'PaymentItems'; // Specify the Prisma model name for entity
  }

  async find(id: number): Promise<Payment_items> {
    return this.prisma[this.modelName].findMany({ where: { payment_id: id, status: 1 }});
  }

  async insert(data: Partial<any>): Promise<any> {    
    return this.prisma[this.modelName].create({ data });
  }

//   async updateModule(id: number, data: UpdateModuleDto): Promise<Modules> {
//     const module = await this.findById(id);
    
//     if (!module) {
//       throw new BadRequestException('Module does not exist.');
//     }
    
//     return this.prisma[this.modelName].update({
//       where: { id : id },
//       data: data,
//     });
//   }

    async findById(id: number) {
      return this.prisma[this.modelName].findUnique({ where: { id : id }});
    }
}
