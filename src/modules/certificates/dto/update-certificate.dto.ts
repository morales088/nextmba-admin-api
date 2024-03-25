import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCertificateDto {
  // @IsOptional()
  // @Transform(({ value }) => parseInt(value))
  // student_id: number;

  @IsNotEmpty()
  @IsString()
  student_email: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  course_id: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2]) // [1-course, 2-assignment]
  certificate_tier: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3]) // [1-new, 2-approved, 3-canceled]
  status: number;

  @IsOptional()
  @Transform(({ value }) => value === 'false')
  download: boolean;

}
