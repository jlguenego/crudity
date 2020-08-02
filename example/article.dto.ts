import { Expose } from "class-transformer";
import { IsDefined, IsInt, IsNumber, IsString } from "class-validator";

export class Article {
  @Expose()
  id?: string;

  @Expose()
  @IsDefined()
  @IsString()
  name: string;

  @Expose()
  @IsDefined()
  @IsNumber()
  price: number;

  @Expose()
  @IsDefined()
  @IsInt()
  qty: number;

  @Expose()
  provider?: any;
}
