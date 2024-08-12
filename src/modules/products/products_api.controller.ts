import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('products')
export class ProductsApiController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(ApiKeyGuard)
  @Get('/code/:productCode')
  async getProductCode(@Param('productCode') productCode: string) {
    return this.productsService.getProductByCode(productCode);
  }
}