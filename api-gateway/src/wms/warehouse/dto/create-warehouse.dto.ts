import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @MaxLength(50)
  warehouseCode!: string;

  @IsString()
  @MaxLength(255)
  warehouseName!: string;

  @IsOptional()
  @IsString()
  address?: string;
}
