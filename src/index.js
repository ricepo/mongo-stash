/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import Debug       from 'debug';
import ObjectID    from 'bson-objectid';
import LruCache    from 'lru-cache';

const debug = Debug('mongo-stash');


/**
 * MongoStash class.
 */
export default class MongoStash {

  constructor(collection, options = 500) {
    this.cache = LruCache(options);
    this.collection = collection;

    this.defaults = null;
    this.projection = null;
  }

  /**
   * cache()
   */
  cache(value) {
    if (!value || !value._id) { return null; }
    this.cache.set(value._id.toString(), value);
    return value;
  }

  /**
   * insertOne()
   */
  async insertOne(doc) {

    /* Merge with defaults */
    let defaults = this.defaults;
    if (typeof defaults === 'function') { defaults = defaults(doc); }
    doc = _.merge(Object.create(null), doc, defaults);

    /* Perform the insert operation, cache, then return the result */
    const write = await this.collection.insertOne(doc);
    const entry = write.result.ops[0];
    this.cache.set(entry._id.toString(), entry);
    return entry;

  }

  /**
   * insertMany()
   */
  async insertMany(items) {

    /* Merge with defaults */
    const isFunc = (typeof this.defaults === 'function');
    items = items.map(item =>
      _.merge({ }, item, isFunc ? this.defaults(item) : this.defaults)
    );

    /* Perform the insert, cache, then return the result */
    const write = await this.collection.insertMany(items);
    const entries = write.result.ops;
    entries.forEach(entry => this.cache.set(entry._id.toString(), entry));
    return entries;
  }

  /**
   * findById()
   *
   * TODO: projection?
   */
  async findById(id) {
    const cached = this.cache.get(id.toString());
    if (cached) { return cached; }

    const query = { _id: ObjectID(id) };
    const result = await this.collection.findOneAsync(query);
    return this.cache(result);
  }

}
