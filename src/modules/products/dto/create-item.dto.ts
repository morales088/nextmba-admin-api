import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDecimal, IsNotEmpty, IsOptional, IsString, ValidateNested, isNumber } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  course_id: number;

  @IsNotEmpty()
  quantity: number;
}
