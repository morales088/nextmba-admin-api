import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;

  @IsOptional()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  @IsString()
  password: string;
}
