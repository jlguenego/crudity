import { Expose } from "class-transformer";
import { IsDefined, IsInt, IsNumber } from "class-validator";

export class Article {
  @Expose()
  id: string;

  @Expose()
  @IsDefined()
  name: string;

  @Expose()
  @IsDefined()
  @IsNumber()
  price: number;

  @Expose()
  @IsDefined()
  @IsInt()
  qty: number;
}
