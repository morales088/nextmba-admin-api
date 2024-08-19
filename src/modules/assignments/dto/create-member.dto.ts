import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  group_id: number;

  @IsNotEmpty()
  @IsString()
  email: string;

  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // student_id: number;
}
