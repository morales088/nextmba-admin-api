import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchPaymentFilterDTO {
  @IsOptional()
  search: string;

  @IsOptional()
  product_code: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page_number: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  per_page: number;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  start_date: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  end_date: Date;
}

export class ExportPaymentFilterDTO extends SearchPaymentFilterDTO {}
