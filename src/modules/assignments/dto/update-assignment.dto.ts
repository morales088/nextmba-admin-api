import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentDto {
  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // course_id: number;

  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // module_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  type: number;

  @IsOptional()
  @IsString()
  details: string;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;

}
