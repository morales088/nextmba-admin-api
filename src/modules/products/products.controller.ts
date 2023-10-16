import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './services/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
    constructor(
      private readonly productsService: ProductsService,
      
    ) {}

  @Get('/:productId')
  async getProduct(
    @Param('productId') productId: number
    ) {
    return await this.productsService.getProduct(productId);
  }

  @Get('/')
  async getProducts() {
    return await this.productsService.getProducts();
  }

  @Post('/')
  async createProduct(@Body() createProductDto: CreateProductDto) {

    const product = {
      ...createProductDto,
    };

    return await this.productsService.createProduct(product);

  }

  @Put('/:productId')
  async UpdateCourse(
    @Param('productId') productId: number,
    @Request() req: any, 
    @Body() updateProductDto: UpdateProductDto) {
    const details = req.user;
    return await this.productsService.updateProduct(productId, updateProductDto);

  }
}
