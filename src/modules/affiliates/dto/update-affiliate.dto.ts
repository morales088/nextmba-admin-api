import { Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AffiliateStatus } from '../../../common/constants/enum';

export class UpdateAffiliateDto {
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
  @Transform(({ value }) => parseInt(value))
  @IsEnum(AffiliateStatus)
  status: number;
}
