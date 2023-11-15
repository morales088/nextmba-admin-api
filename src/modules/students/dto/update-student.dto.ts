import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, isNumber } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  industry: string;

  @IsOptional()
  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  position: string;
  
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr']) // en - english, es - espanish, pt - portuguese, fr - french
  language: string;

  @IsOptional()
  @IsString()
  profile_picture: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3]) // [1 - trial, 2 - regular, 3 - pro]
  account_type: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // [0 - not, 1 - partner]
  affiliate_access: number;

  @IsOptional()
  @IsString()
  website: string;

  @IsOptional()
  @IsString()
  linkedIn: string;

  @IsOptional()
  @IsString()
  instagram: string;

  @IsOptional()
  @IsString()
  telegram: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
