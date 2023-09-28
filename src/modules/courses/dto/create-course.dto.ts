import { Prisma } from '@prisma/client';
import { IsDecimal, IsNotEmpty, IsOptional, IsString, isNumber } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  cover_photo: string;

  @IsOptional()
  @IsString()
  course_link: string;
  
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: Prisma.Decimal;

  @IsOptional()
  @IsString()
  telegram_link: string;

  @IsOptional()
  paid: number;

  @IsOptional()
  is_displayed: number;
}
