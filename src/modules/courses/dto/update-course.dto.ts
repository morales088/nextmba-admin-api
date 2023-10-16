import { Prisma } from '@prisma/client';
import { IsDecimal, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
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

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  price: Prisma.Decimal;

  @IsOptional()
  @IsString()
  telegram_link: string;

  @IsOptional()
  paid: number;

  @IsOptional()
  is_displayed: number;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
