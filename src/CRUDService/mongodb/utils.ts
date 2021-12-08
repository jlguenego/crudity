import {CrudityFilterObject} from './../../interfaces/CrudityQueryString';
import {Document, Filter, Sort} from 'mongodb';
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

export const getSortObj = (orderBySpec: string): Sort => {
  const sortObj: Sort = {};
  for (const orderByItem of orderBySpec.split(',')) {
    const {direction, field} = getSortArgs(orderByItem);
    sortObj[field] = direction;
  }
  return sortObj;
};

export const getFilterObj = (filter: CrudityFilterObject): Filter<Document> => {
  if (!filter) {
    return {};
  }
  const result = Object.entries(filter).map(([field, value]) => {
    if (typeof value !== 'string') {
      throw new Error('not supported yet');
    }

    // case: the string looks like a number
    const num = +value;
    if (!isNaN(num)) {
      return {$or: [{[field]: value}, {[field]: +value}]};
    }

    // case: it is a regex
    const regexPattern = /^\/(.*)\/(.*)$/;
    const array = regexPattern.exec(value);
    if (array !== null) {
      return {[field]: {$regex: new RegExp(array[1], array[2])}};
    }

    return {[field]: value};
  });

  return {$and: result};
};
