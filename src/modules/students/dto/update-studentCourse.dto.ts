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

export class UpdateStudentCourseDto {
  @IsOptional()
  @IsNumber()
  module_quantity: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  starting_date: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiration_date: Date;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
