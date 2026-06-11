import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  warehouseCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  warehouseName?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
