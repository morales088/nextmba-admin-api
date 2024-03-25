import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCertificateDto {
  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // student_id: number;

  @IsNotEmpty()
  @IsString()
  student_email: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  course_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2]) // [1-course, 2-assignment]
  certificate_tier: number;

  // @IsOptional()
  // @Transform(({ value }) => parseInt(value))
  // @IsIn([1, 2, 3]) // [1-new, 2-approved, 3-canceled]
  // status: number;

}
