import {Document} from 'mongodb';
import {Idable} from '../../interfaces/Idable';

export const renameId = <T extends Idable>(doc: Document): T => {
  const result = {id: doc._id, ...doc} as T;
  delete (result as unknown as {_id: unknown})._id;
  return result;
};

export const renameIdForArray = <T extends Idable>(docs: Document[]): T[] =>
  docs.map(doc => renameId(doc));

export const removeId = <T extends Idable>(a: T): Omit<T, 'id'> => {
  const result: Partial<T> = {...a};
  delete result.id;
  return result as Omit<T, 'id'>;
};

export const getSortArgs = (
  orderByStr: string
): {direction: 1 | -1; field: string} => {
  if (orderByStr.startsWith('-')) {
    return {
      direction: -1,
      field: orderByStr.substring(1),
    };
  }
  if (orderByStr.startsWith('+')) {
    return {
      direction: 1,
      field: orderByStr.substring(1),
    };
  }
  return {
    direction: 1,
    field: orderByStr,
  };
};
