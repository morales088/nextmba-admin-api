import { Prisma } from '@prisma/client';
import { IsDateString, IsNotEmpty, IsOptional, IsString, isNumber } from 'class-validator';

export class UpdateModuleDto {

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  zoom_link: string;

  @IsOptional()
  @IsString()
  external_link: string;

  @IsOptional()
  @IsDateString()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  end_date: Date;
}
