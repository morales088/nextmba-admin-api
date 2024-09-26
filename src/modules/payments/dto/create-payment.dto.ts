import { Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDecimal, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CommissionStatus, PaymentOrigin, PaymentStatus } from '../../../common/constants/enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  product_code: number;

  @IsOptional()
  @IsString()
  reference_id: string;

  @IsNotEmpty()
  price: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(PaymentOrigin)
  origin: number;

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
  @Transform(({ value }) => parseInt(value))
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
  @Transform(({ value }) => parseInt(value))
  @IsEnum(CommissionStatus)
  commission_status: number;

  @IsOptional()
  @IsString()
  remarks: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(PaymentStatus)
  status: number;
}
