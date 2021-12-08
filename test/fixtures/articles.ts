import {NewArticle} from '../misc/Article';

export const a1: NewArticle = {
  name: 'Tournevis',
  price: 1.23,
  qty: 345,
};
export const a2: NewArticle = {
  name: 'Pince',
  pricexxx: 67.0,
  qty: 79,
} as unknown as NewArticle;

export const oneHundredArticles = new Array(100).fill(0).map(
  (n, i) =>
    ({
      name: `Test ${i}`,
      price: (i * 17) % 20,
      qty: (i * 23) % 200,
      tags: [`tag${i}`, `tag${i + 1}`],
    } as NewArticle)
);
