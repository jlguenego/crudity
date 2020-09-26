import { Expose } from "class-transformer";
import { IsString, IsDefined } from "class-validator";

export class Provider {
  @Expose()
  @IsDefined()
  @IsString()
  name!: string;

  @Expose()
  @IsDefined()
  @IsString()
  zipcode!: string;
}
