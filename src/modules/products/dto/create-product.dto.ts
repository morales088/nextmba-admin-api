import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDecimal, IsNotEmpty, IsOptional, IsString, ValidateNested, isNumber } from 'class-validator';
import { CreateItemDto } from './create-item.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;
  
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: Prisma.Decimal;

  @IsOptional()
  pro_access: boolean;

  @IsOptional()
  library_access: boolean;
  
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  // @IsArray({ message: '["product_id" : 1, "course_id" : 1, "quantity": 1]' })
  product_items: CreateItemDto[];
}


// export class ItemsDTO {

//   @IsNotEmpty()
//   course_id: number;

//   @IsNotEmpty()
//   quantity: number;
// }