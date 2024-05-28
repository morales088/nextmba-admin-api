import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StudentFilterDTO {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  enrolled_to: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  not_enrolled_to: number;

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

export class SearchStudentFilterDTO extends StudentFilterDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search: string;

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
  page_number: number;

  @IsOptional()
  per_page: number;
}

export class ExportStudentFilterDTO extends SearchStudentFilterDTO {}
