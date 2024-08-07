import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentGroupDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  course_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  link: string;

  @IsOptional()
  is_public: boolean;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  status: number;

}
