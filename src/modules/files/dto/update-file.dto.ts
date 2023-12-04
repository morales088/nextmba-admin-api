import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  topic_id: number;

  // @IsNotEmpty()
  // module_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2]) // [1 - materials, 2 - assignment]
  type: number;

  @IsOptional()
  @IsString()
  file_link: string;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;

}
