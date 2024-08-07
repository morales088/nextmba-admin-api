import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentEmailDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  emails: string;

}
