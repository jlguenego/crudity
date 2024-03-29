import { Collection, Document, Filter, MongoClient, ObjectId } from "mongodb";
import { MongoDBStorageOptions } from "../../interfaces/CrudityOptions";
import { CrudityQueryString } from "../../interfaces/CrudityQueryString";
import { Idable } from "../../interfaces/Idable";
import { CRUDService } from "../CRUDService";
import { PaginatedResult } from "../../interfaces/PaginatedResult";
import {
  getFilterObj,
  getSortObj,
  removeId,
  renameId,
  renameIdForArray,
} from "./utils";

export class MongoDBCRUDService<T extends Idable> extends CRUDService<T> {
  client: MongoClient;
  collection: Collection<Document>;

  constructor(resourceName: string, public options: MongoDBStorageOptions) {
    super(resourceName);
    this.client = new MongoClient(this.options.uri, this.options.opts);
    this.collection = this.client.db().collection(this.resourceName);
  }

  async add(item: T): Promise<T> {
    // Note that MongoDB API insertOne modifies the item argument by adding _id to it.
    // That is why we clone it before.
    const doc = { ...item };
    await this.client.db().collection(this.resourceName).insertOne(doc);
    return renameId<T>(doc);
  }

  async addMany(newItems: T[]): Promise<T[]> {
    const docs = newItems.map((newItem) => removeId(newItem));
    await this.client.db().collection(this.resourceName).insertMany(docs);
    return renameIdForArray(docs);
  }

  async get(
    query: CrudityQueryString,
    defaultPageSize = 10
  ): Promise<PaginatedResult<T>> {
    const pageSize =
      query.pageSize === undefined ? defaultPageSize : +query.pageSize;
    const pageNbr = query.page === undefined ? 1 : +query.page;
    const skipNbr = pageSize * (pageNbr - 1);

    // find
    const filter: Filter<Document> = getFilterObj(query.filter);
    let found = this.collection.find(filter);

    // orderBy
    if (query.orderBy) {
      found = found.sort(getSortObj(query.orderBy));
    }

    const result = await found.skip(skipNbr).limit(pageSize).toArray();
    const length = await this.collection.countDocuments(filter);
    const paginatedResult = {
      array: renameIdForArray<T>(result),
      page: pageNbr,
      pageSize,
      length,
    };
    return paginatedResult;
  }

  async getOne(id: string): Promise<T | undefined> {
    const objectId = new ObjectId(id);
    const result = await this.collection.findOne({ _id: objectId });
    if (!result) {
      throw new Error("not found");
    }
    return renameId<T>(result);
  }

  async patch(id: string, body: Partial<T>): Promise<T> {
    const objectId = new ObjectId(id);

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      { $set: body }
    );
    if (!result) {
      throw new Error("not found");
    }

    return (await this.getOne(id)) as T;
  }

  async remove(ids: string[]): Promise<void> {
    await this.collection.deleteMany({
      _id: {
        $in: ids.map((id) => new ObjectId(id)),
      },
    });
  }

  async removeAll(): Promise<void> {
    await this.collection.deleteMany({});
  }

  async rewrite(newT: T): Promise<T> {
    const objectId = new ObjectId(newT.id);

    const result = await this.collection.findOneAndReplace(
      { _id: objectId },
      newT
    );
    if (!result) {
      throw new Error("not found");
    }

    return (await this.getOne(newT.id)) as T;
  }

  async start(): Promise<void> {
    await this.client.connect();
  }

  async stop(): Promise<void> {
    await this.client.close();
  }
}
