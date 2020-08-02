import { Expose } from "class-transformer";
import { IsDefined } from "class-validator";

export class Article {
  @Expose()
  id: string;

  @Expose()
  @IsDefined()
  name: string;

  @Expose()
  @IsDefined()
  price: number;

  @Expose()
  @IsDefined()
  qty: number;
}
