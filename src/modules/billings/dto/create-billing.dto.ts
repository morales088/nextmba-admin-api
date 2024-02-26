import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBillingDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  student_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  notes: string;

}
