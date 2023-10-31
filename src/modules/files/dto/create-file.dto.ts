import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  topic_id: number;

  @IsNotEmpty()
  module_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsIn([1, 2]) // [1 - materials, 2 - assignment]
  type: number;

  @IsNotEmpty()
  @IsString()
  file_link: string;

}
