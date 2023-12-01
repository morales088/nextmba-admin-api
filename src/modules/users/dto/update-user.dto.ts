import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;
}
