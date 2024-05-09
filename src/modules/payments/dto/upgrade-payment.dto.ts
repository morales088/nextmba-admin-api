import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpgradePaymentDTO {
  @IsOptional()
  @IsString()
  reference_id: string;

  @IsNotEmpty()
  @IsString()
  product_code: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  price: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}

export class PaymentLeadsDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  product_code: number;

  @IsOptional()
  @IsString()
  reference_id: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  price: number;

  @IsNotEmpty()
  @IsString()
  language: string;
}
