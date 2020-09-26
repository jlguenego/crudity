import "reflect-metadata";
import { Expose, Type } from "class-transformer";
import { IsDefined, IsInt, IsNumber, IsString, ValidateNested } from "class-validator";
import { Provider } from "./provider.dto";

export class Article {
  @Expose()
  id!: string;

  @Expose()
  @IsDefined()
  @IsString()
  name!: string;

  @Expose()
  @IsDefined()
  @IsNumber()
  price!: number;

  @Expose()
  @IsDefined()
  @IsInt()
  qty!: number;

  @ValidateNested()
  @Expose()
  @Type(() => Provider)
  provider?: Provider;
}
