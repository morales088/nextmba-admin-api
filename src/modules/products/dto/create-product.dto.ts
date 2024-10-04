import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  isNumber,
} from 'class-validator';
import { ChargeType } from '../../../common/constants/enum';

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
  @IsEnum(ChargeType)
  charge_type: number;

  @IsOptional()
  pro_access: boolean;

  @IsOptional()
  library_access: boolean;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemsDTO)
  // @IsArray({ message: '["product_id" : 1, "course_id" : 1, "quantity": 1]' })
  product_items: ItemsDTO[];
}

export class ItemsDTO {
  @IsNotEmpty()
  course_id: number;

  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2]) // [1-full, 2-limited]
  course_tier: number;
}
