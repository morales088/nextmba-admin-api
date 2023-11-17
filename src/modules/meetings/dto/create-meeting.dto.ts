import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested, isNumber } from 'class-validator';

export class CreateMeetingDto {
  @IsNotEmpty()
  module_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200, {
    message: 'Maximum of 200 character.',
  })
  title: string;
}
