import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CourseTierStatus } from '../../../common/constants/enum';

export class CreateStudentCourseDto {
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @IsNotEmpty()
  @IsNumber()
  course_id: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3]) // [1 - paid, 2 - manually added, 3 - gifted]
  course_type: number;

  @IsOptional()
  @IsNumber()
  module_quantity: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  starting_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiration_date: Date;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(CourseTierStatus)
  course_tier: number;
}
