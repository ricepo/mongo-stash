/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';

import Cache       from './cache';
import * as Insert from './insert';
import * as Find   from './find';
import * as Update from './update';
import * as Delete from './delete';


/**
 * MongoStash class.
 */
export default function MongoStash(collection, options = 500) {

  if (!(this instanceof MongoStash)) {
    return new MongoStash(collection, options);
  }

  this.cache = Cache(this, options);
  this.collection = collection;

  this.defaults = Object.create(null);
  this.projection = Object.create(null);

  this.safeMode = false;
}


/*!
 * Attach all member functions.
 */
_.assign(MongoStash.prototype, {

  insertOne:  Insert.one,
  insertMany: Insert.many,

  findById:   Find.byId,
  findOne:    Find.one,
  find:       Find.list,

  updateOne:  Update.one,
  updateMany: Update.many,
  updateSafe: Update.safe,

  deleteOne:  Delete.one,
  deleteMany: Delete.many,
  deleteSafe: Delete.safe

});
