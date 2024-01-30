import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDecimal, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  applied_studies_description: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  starting_date: Date;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
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

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
