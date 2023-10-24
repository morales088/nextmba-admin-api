import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
//   @IsNotEmpty()
//   student_id: number;

  @IsNotEmpty()
  product_code: number;

  @IsOptional()
  @IsString()
  reference_id: string;
  
  // @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  // price: Prisma.Decimal;
  price: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2]) 
  payment_method: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  contact_number: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsNumber()
  created_by: number;

  @IsOptional()
  @IsString()
  utm_source: string;

  @IsOptional()
  @IsString()
  utm_medium: string;

  @IsOptional()
  @IsString()
  utm_campaign: string;

  @IsOptional()
  @IsString()
  utm_content: string;

  @IsOptional()
  @IsNumber()
  from_student_id: number;

  @IsOptional()
  @IsString()
  affiliate_code: string;
  
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  commission_percentage: Prisma.Decimal;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) //[0 - unpaid, 1 - paid]
  commission_status: number;

  @IsOptional()
  @IsString()
  remarks: string;
}
