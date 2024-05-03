import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  course_id: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  type: number;

  @IsOptional()
  @IsString()
  details: string;

}
