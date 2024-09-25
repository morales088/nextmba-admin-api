import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './services/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/:productId')
  async getProduct(@Param('productId') productId: number) {
    return await this.productsService.getProduct(productId);
  }

  @Get('/')
  async getProducts() {
    return await this.productsService.getProducts();
  }

  @Post('/')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Put('/:productId')
  async updateCourse(@Param('productId') productId: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(productId, updateProductDto);
  }
}
