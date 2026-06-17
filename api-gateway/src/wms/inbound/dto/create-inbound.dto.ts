import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateInboundItemDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  locationId!: string;

  @IsInt()
  @Min(1)
  actualQty!: number;
}

export class CreateInboundDto {
  @IsString()
  @MaxLength(50)
  inboundNo!: string;

  @IsUUID()
  warehouseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  supplierName?: string;

  @IsOptional()
  @IsDateString()
  actualDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInboundItemDto)
  items!: CreateInboundItemDto[];
}
