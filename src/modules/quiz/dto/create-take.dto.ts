import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTakeDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  quiz_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  student_id: number;
}
