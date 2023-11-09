import { Prisma } from '@prisma/client';
import { IsBoolean, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAffiliateDto {
//   @IsOptional()
//   @IsString()
//   code: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  percentage: Prisma.Decimal;

  @IsOptional()
  @IsString()
  withdrawal_info: string;

  @IsOptional()
  @IsString()
  remarks: string;
  
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2]) //[0 - cancel, 1 - proccessed, 2 - pending]
  status: number;

}
