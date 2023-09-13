import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDTO{
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class ValidateUserDTO {
  sub: string;
  name: string;
  email: string;
}