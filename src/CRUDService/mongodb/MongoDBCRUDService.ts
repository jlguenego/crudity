import {MongoDBStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';
import {MongoClient, ObjectId} from 'mongodb';
import {renameId, renameIdForArray} from './utils';

export class MongoDBCRUDService<T extends Idable> extends CRUDService<T> {
  client = new MongoClient(this.options.uri, this.options.opts);

  constructor(resourceName: string, public options: MongoDBStorageOptions) {
    super(resourceName);
  }

  async add(item: T): Promise<T> {
    // Note that MongoDB API insertOne modifies the item argument by adding _id to it.
    // That is why we clone it before.
    const doc = {...item};
    const result = await this.client
      .db()
      .collection(this.resourceName)
      .insertOne(doc);
    console.log('result: ', result);
    return renameId<T>(doc);
  }

  async get(
    query: CrudityQueryString,
    pageSize: number
  ): Promise<Partial<T>[]> {
    const result = await this.client
      .db()
      .collection(this.resourceName)
      .find({})
      .toArray();
    console.log('result: ', result);
    return renameIdForArray<T>(result);
  }

  async getOne(id: string): Promise<T | undefined> {
    const objectId = new ObjectId(id);
    const result = await this.client
      .db()
      .collection(this.resourceName)
      .findOne({_id: objectId});
    console.log('result: ', result);
    if (!result) {
      throw new Error('not found');
    }
    const result2 = renameId<T>(result);
    console.log('result2: ', result2);
    return result2;
  }

  patch(id: string, body: Partial<T>): Promise<T> {
    throw new Error('not implemented.');
  }

  remove(ids: string[]): Promise<void> {
    throw new Error('not implemented.');
  }

  async removeAll(): Promise<void> {
    await this.client.db().collection(this.resourceName).deleteMany({});
  }

  rewrite(arg0: T): Promise<T> {
    throw new Error('not implemented.');
  }

  async start(): Promise<void> {
    await this.client.connect();
  }

  async stop(): Promise<void> {
    await this.client.close();
  }
}
