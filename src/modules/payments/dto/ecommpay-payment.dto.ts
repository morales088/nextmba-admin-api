import {
  IsCurrency,
  IsEmail,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEcommpayPaymentDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  customer_first_name: string;

  @IsNotEmpty()
  @IsString()
  customer_last_name: string;

  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  payment_currency: string;

  @IsNotEmpty()
  @IsNumber()
  payment_amount: number;

  @IsOptional()
  @IsString()
  force_payment_method: string;

  @IsOptional()
  @IsString()
  target_element: string;

  @IsNotEmpty()
  @IsString()
  success_url: string;
}
