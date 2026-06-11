import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateWarehouseLocationDto {
  @IsUUID()
  warehouseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  zone?: string;
}
