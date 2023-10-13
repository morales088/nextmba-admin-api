import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './services/products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
    constructor(
      private readonly productsService: ProductsService,
      
    ) {}

  @Get('/')
  async getCourses() {
    return await this.productsService.getProducts();
  }

  @Post('/')
  async createCourse(@Body() createProductDto: CreateProductDto) {

    const product = {
      ...createProductDto,
    };

    return await this.productsService.createProduct(product);

  }

//   @Put('/:courseId')
//   async UpdateCourse(
//     @Param('courseId') courseId: number,
//     @Request() req: any, 
//     @Body() updateCourseDto: UpdateCourseDto) {
//     const details = req.user;
//     return await this.courseService.updateCourse(courseId,updateCourseDto);

//   }
}
