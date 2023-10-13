import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository
  ) {}

  async getProducts() {
    return this.productRepository.find();
  }

  async createProduct(data) {
    return this.productRepository.insert(data);
  }

//   async updateCourse(id: number, data) {
//     return this.courseRepository.updateCourse(id, data);
//   }
}
