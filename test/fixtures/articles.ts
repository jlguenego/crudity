import {Article, NewArticle} from '../misc/Article';

export const a1: Article = {
  id: 'a1',
  name: 'Tournevis',
  price: 1.23,
  qty: 345,
};
export const a2: Article = {
  id: 'a2',
  name: 'Pince',
  price: 67.0,
  qty: 79,
};

export const oneHundredArticles = new Array(100).fill(0).map(
  (n, i) =>
    ({
      name: 'Truc',
      price: i / 100,
      qty: i,
    } as NewArticle)
);
