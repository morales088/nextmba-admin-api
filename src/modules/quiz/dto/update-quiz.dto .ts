import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateQuizDto {
  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // module_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  start_date: string;

  @IsOptional()
  @IsString()
  deadline: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  score: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  question_qty: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1, 2]) // 0 - delete, 1 - active, 2 - published
  status: number;
}
