import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3]) //(1-easy, 2-meduim. 3-hard)
  difficulty: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  active: boolean;
}
