import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code: string;
  
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  price: Prisma.Decimal;

  @IsOptional()
  pro_access: boolean;

  @IsOptional()
  library_access: boolean;
  
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemsDTO)
  product_items: ItemsDTO[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}

export class ItemsDTO {
  @IsNotEmpty()
  course_id: number;

  @IsOptional()
  quantity: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2]) // [1-full, 2-limited]
  course_tier: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
