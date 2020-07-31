export interface Article {
  id?: string;
  name: string;
  price: number;
  qty: number;
  provider?: {
    name: string;
    zipcode: string;
  };
}
