import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  topic_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2]) // [1 - materials, 2 - assignment]
  type: number;

  @IsOptional()
  @IsString()
  file_link: string;

}
