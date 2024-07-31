import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentEmailDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  emails: string;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  status: number;

}
