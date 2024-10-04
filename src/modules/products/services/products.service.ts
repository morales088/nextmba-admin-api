import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProduct(id: number) {
    return this.productRepository.findById(id);
  }

  async getProducts() {
    return this.productRepository.find();
  }

  async getProductByCode(productCode: string) {
    return this.productRepository.findByCode(productCode);
  }

  async createProduct(data: CreateProductDto) {
    return this.productRepository.insert(data);
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    return this.productRepository.updateProduct(id, data);
  }
}
