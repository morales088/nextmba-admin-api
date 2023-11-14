import { Transform } from "class-transformer"
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class CreateAdminDTO {
  @IsNotEmpty()
  @IsString()
  name: string
  
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  password: string

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2])
  role: number

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  status: number; // 1 - active, 0 - deactivated
}

export class UpdateAdminDTO {
  @IsOptional()
  @IsNotEmpty()
  role: number

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  status: number; // 1 - active, 0 - deactivated
}