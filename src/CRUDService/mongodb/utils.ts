import {Document} from 'mongodb';
import {Idable} from '../../interfaces/Idable';

export const renameId = <T extends Idable>(doc: Document): T => {
  const result = {id: doc._id, ...doc} as T;
  delete (result as unknown as {_id: unknown})._id;
  return result;
};

export const renameIdForArray = <T extends Idable>(docs: Document[]): T[] =>
  docs.map(doc => renameId(doc));
