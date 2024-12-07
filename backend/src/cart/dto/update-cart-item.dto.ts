import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}