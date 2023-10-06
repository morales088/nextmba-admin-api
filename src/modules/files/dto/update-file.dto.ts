import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFileDto {
//   @IsNotEmpty()
//   topic_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsIn([1, 2]) // [1 - materials, 2 - assignment]
  type: number;

  @IsOptional()
  @IsString()
  file_link: string;
  
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;

}
