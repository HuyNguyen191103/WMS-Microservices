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

export class UpdateInboundItemDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  locationId!: string;

  @IsInt()
  @Min(1)
  actualQty!: number;
}

export class UpdateInboundDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  inboundNo?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  supplierName?: string;

  @IsOptional()
  @IsDateString()
  actualDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateInboundItemDto)
  items?: UpdateInboundItemDto[];
}
