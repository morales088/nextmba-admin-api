import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAnswerDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  question_id: number;

  @IsOptional()
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

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
