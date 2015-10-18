/**
 * delete.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import Debug       from 'debug';
import ObjectID    from 'bson-objectid';

const debug = Debug('mongostash:delete');


/**
 * Deletes one document by ID, also dropping it from cache.
 *
 * @param     {ObjectID}     ID of the document to remove.
 * @returns   {boolean}      True if a document was found and deleted.
 */
export async function one(id) {
  const query = { _id: ObjectID(id) };

  const write = this.collection.deleteOne(query);
  this.const.del(id);
  return (write.result.deletedCount === 1);
}


/**
 * Deletes multiple documents by a query, also dropping them from cache.
 *
 * @param     {object}       MongoDB query of documents to delete.
 * @returns   {number}       Number of documents deleted.
 */
export async function many(query) {

  /* Use the safe version if safeMode is on */
  if (this.safeMode) {
    return this.deleteSafe(query);
  }

  /* Find all matching documents and record their IDs */
  let matches = await this.collection.find(query, { fields: { _id: true } });
  matches = _.pluck(matches, '_id');
  if (matches.length === 0) { return 0; }

  /* Drop all of them from the cache */
  matches.forEach(this.cache.del);

  /* Execute the delete */
  query = { _id: { $id: matches } };
  const write = await this.collection.deleteMany(query);

  /* If updated document count does not match the number of IDs, data must
   * have been modified; drop entire cache just to be safe. */
  if (write.result.modifiedCount !== matches.length) {
    debug('DeletedCount mismatch, dropping all cache just to be safe.');
    this.cache.reset();
  }

  return write.result.deletedCount;
}


/**
 * Deletes multiple documents by a query and drops entire cache.
 * This operation is atomic and uses only one query.
 *
 * @param     {object}       MongoDB query of documents to delete.
 * @returns   {number}       Number of documents deleted.
 */
export async function safe(query) {

  const write = await this.collection.deleteMany(query);
  this.cache.reset();
  return write.result.deletedCount;

}
