import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExportStudentFilterDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  enrolled_to: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  not_enrolled_to: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  company?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  account_type: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  course_tier: number;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  start_date: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  end_date: Date;
}
