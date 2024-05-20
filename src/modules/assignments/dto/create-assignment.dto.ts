import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  course_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  type: number;

  @IsOptional()
  @IsString()
  details: string;

}
