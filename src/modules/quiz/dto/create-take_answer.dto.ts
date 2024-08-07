import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTakeAnswerDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  take_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  question_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  answer_id: number;
}
