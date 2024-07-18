import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  question_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  correct: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  active: number;
}
