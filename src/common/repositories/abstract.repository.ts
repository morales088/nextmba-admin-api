import { PrismaClient } from '@prisma/client';
import { IRepository } from './repository.interface';

export abstract class AbstractRepository<T> implements IRepository<T> {
  constructor(protected readonly prisma: PrismaClient) {}
  
  abstract get modelName(): string;

  async findById(id: number): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.prisma[this.modelName].findMany();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.prisma[this.modelName].create({ data });
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    return this.prisma[this.modelName].update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma[this.modelName].delete({ where: { id } });
  }

}
