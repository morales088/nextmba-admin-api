import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateQuizDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // question_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  score: number;

  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // question_qty: number;
}
