import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CheckoutDataDTO {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
