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
  @Transform(({ value }) => value === 'true')
  correct: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  active: boolean;
}
