import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class UploadUserImageDTO {
  @IsString()
  imageUrl: string;

  @IsString()
  cloudinaryPublicId: string;
}
