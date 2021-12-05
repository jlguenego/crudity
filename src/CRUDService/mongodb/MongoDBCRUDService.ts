import {PaginatedResult} from './../../interfaces/PaginatedResult';
import {MongoDBStorageOptions} from '../../interfaces/CrudityOptions';
import {CrudityQueryString} from '../../interfaces/CrudityQueryString';
import {Idable} from '../../interfaces/Idable';
import {CRUDService} from '../CRUDService';
import {Document, Filter, MongoClient, ObjectId} from 'mongodb';
import {renameId, renameIdForArray, removeId, getSortArgs} from './utils';

export class MongoDBCRUDService<T extends Idable> extends CRUDService<T> {
  client = new MongoClient(this.options.uri, this.options.opts);
  collection = this.client.db().collection(this.resourceName);

  constructor(resourceName: string, public options: MongoDBStorageOptions) {
    super(resourceName);
  }

  async add(item: T): Promise<T> {
    // Note that MongoDB API insertOne modifies the item argument by adding _id to it.
    // That is why we clone it before.
    const doc = {...item};
    await this.client.db().collection(this.resourceName).insertOne(doc);
    return renameId<T>(doc);
  }

  async addMany(newItems: T[]): Promise<T[]> {
    const docs = newItems.map(newItem => removeId(newItem));
    await this.client.db().collection(this.resourceName).insertMany(docs);
    return renameIdForArray(docs);
  }

  async get(
    query: CrudityQueryString,
    defaultPageSize: number
  ): Promise<PaginatedResult<T>> {
    const pageSize =
      query.pageSize === undefined ? defaultPageSize : +query.pageSize;
    const pageNbr = query.page === undefined ? 1 : +query.page;
    const skipNbr = pageSize * (pageNbr - 1);
    // find
    let found = this.collection.find();

    // orderBy
    if (query.orderBy) {
      for (const orderByItem of query.orderBy.split(',')) {
        const {direction, field} = getSortArgs(orderByItem);
        found = found.sort(field, direction);
      }
    }

    const result = await found.skip(skipNbr).limit(pageSize).toArray();
    const length = await this.collection.countDocuments();
    console.log('length: ', length);
    const paginatedResult = {
      array: renameIdForArray<T>(result),
      page: pageNbr,
      pageSize,
      length,
    };
    console.log('paginatedResult: ', paginatedResult);
    return paginatedResult;
  }

  async getOne(id: string): Promise<T | undefined> {
    const objectId = new ObjectId(id);
    const result = await this.collection.findOne({_id: objectId});
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

  async remove(ids: string[]): Promise<void> {
    await this.collection.deleteMany({
      _id: {
        $in: ids.map(id => new ObjectId(id)),
      },
    });
  }

  async removeAll(): Promise<void> {
    await this.collection.deleteMany({});
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
