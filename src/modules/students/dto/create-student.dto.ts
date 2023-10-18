import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, isNumber } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  @IsString()
  password: string;

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
  
  @IsNotEmpty()
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
  @IsNumber()
  @IsIn([0, 1]) // [0 - not, 1 - partner]
  affiliate_access: number;
}
