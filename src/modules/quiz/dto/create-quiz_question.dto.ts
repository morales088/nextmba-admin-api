import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateQuizQuestionDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  quiz_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  question_id: number;
}
