import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsDateString, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, isNumber } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
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
  
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr']) // en - english, es - espanish, pt - portuguese, fr - french
  language: string;

  @IsOptional()
  @IsString()
  profile_picture: string;

  @IsOptional()
  chat_moderator: boolean;

  @IsOptional()
  chat_access: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
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
  linkendIn: string;

  @IsOptional()
  @IsString()
  instagram: string;

  @IsOptional()
  @IsString()
  telegram: string;
}