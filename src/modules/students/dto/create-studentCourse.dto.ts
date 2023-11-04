import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsDecimal,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isNumber,
} from 'class-validator';

export class CreateStudentCourseDto {
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @IsOptional()
  @IsNumber()
  module_quantity: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  starting_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiration_date: Date;
}
