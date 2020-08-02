import { Expose } from "class-transformer";
import { IsDefined, IsInt, IsCurrency } from "class-validator";

export class Article {
  @Expose()
  id: string;

  @Expose()
  @IsDefined()
  name: string;

  @Expose()
  @IsDefined()
  @IsCurrency()
  price: number;

  @Expose()
  @IsDefined()
  @IsInt()
  qty: number;
}
