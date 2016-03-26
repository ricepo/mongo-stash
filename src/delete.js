/**
 * delete.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');
const Debug        = require('debug')('mongostash:delete');
const ObjectID     = require('./objectid');


/**
 * Deletes one document by ID, also dropping it from cache.
 *
 * @param     {ObjectID}     ID of the document to remove.
 * @returns   {boolean}      True if a document was found and deleted.
 */
async function one(id) {
  const query = { _id: ObjectID(id) };
  this.cache.del(id);

  const write = await this.collection.deleteOne(query);
  return (write.deletedCount === 1);
}


/**
 * Deletes multiple documents by a query, also dropping them from cache.
 *
 * @param     {object}       MongoDB query of documents to delete.
 * @returns   {number}       Number of documents deleted.
 */
async function many(query) {

  /* Use the safe version if safeMode is on */
  if (this.safeMode) {
    return this.deleteSafe(query);
  }

  /* Find all matching documents and record their IDs */
  let matches = await this.collection.find(query, { fields: { _id: true } }).toArray();
  matches = _.map(matches, '_id');
  if (matches.length === 0) { return 0; }

  /* Drop all of them from the cache */
  matches.forEach(i => this.cache.del(i));

  /* Execute the delete */
  query = { _id: { $in: matches } };
  const write = await this.collection.deleteMany(query);

  /* If updated document count does not match the number of IDs, data must
   * have been modified; drop entire cache just to be safe. */
  /* istanbul ignore if */
  if (write.deletedCount !== matches.length) {
    Debug('DeletedCount mismatch, dropping all cache just to be safe.');
    this.cache.reset();
  }

  return write.deletedCount;
}


/**
 * Deletes multiple documents by a query and drops entire cache.
 * This operation is atomic and uses only one query.
 *
 * @param     {object}       MongoDB query of documents to delete.
 * @returns   {number}       Number of documents deleted.
 */
async function safe(query) {

  const write = await this.collection.deleteMany(query);
  this.cache.reset();
  return write.deletedCount;

}


/**
 * Exports
 */
module.exports = { one, many, safe };
