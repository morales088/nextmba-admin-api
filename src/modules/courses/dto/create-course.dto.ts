import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDecimal, IsNotEmpty, IsOptional, IsString, isNumber } from 'class-validator';

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

  @IsOptional()
  @IsString()
  apllied_studies_description: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  starting_date: Date;
  
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: Prisma.Decimal;

  @IsOptional()
  @IsString()
  telegram_link: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  paid: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  is_displayed: number;
}
