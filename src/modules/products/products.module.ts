import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './services/products.service';
import { ProductRepository } from './repositories/product.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ProductItemRepository } from './repositories/product_item.repository';
import { ProductsApiController } from './products_api.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController, ProductsApiController],
  providers: [ProductsService, ProductRepository, ProductItemRepository],
})
export class ProductsModule {}
