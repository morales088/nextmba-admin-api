import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3]) //(1-easy, 2-meduim. 3-hard)
  difficulty: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  active: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
