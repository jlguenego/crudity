import { Idable } from "../src/Idable.dto";

export class Article extends Idable {
  name: string;
  price: number;
  qty: number;
}
