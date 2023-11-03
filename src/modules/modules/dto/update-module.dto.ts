import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, isNumber } from 'class-validator';

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
  @Type(() => Date)
  start_date: Date;

  @IsOptional()
  @Type(() => Date)
  end_date: Date;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5]) // [1 - draft, 2 - offline, 3 - live, 4 - pending replay, 5 - replay]
  status: number;

  @IsOptional()
  @IsBoolean()
  display_topic: boolean;
}
