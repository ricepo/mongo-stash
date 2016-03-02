/**
 * update.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');
const Debug        = require('debug')('mongostash:update');
const ObjectID     = require('./objectid');


/*!
 * Default update options.
 */
const defaults = { returnOriginal: false };


/**
 * Updates one record by ID and modifies the cache.
 *
 * @param     {ObjectID}     ID of the document to modify.
 * @param     {object}       Changes to apply to the document.
 * @return    {object}       The updated document.
 */
async function one(id, changes, options) {
  const query = { _id: ObjectID(id) };
  options = _.assign({ }, options, defaults);

  const write = await this.collection.findOneAndUpdate(query, changes, options);
  this.cache.set(write.value);
  return write.value;
}


/**
 * Updates multiple records and removes them from cache.
 * WARNING: If you absolutely need this to be an atomic operation,
 * consider using native update() then dropping the cache instead.
 *
 * @param     {object}       MongoDB query of documents to modify.
 * @param     {object}       Changes to apply to the documents.
 * @return    {number}       Number of updated documents.
 */
async function many(query, changes, options) {

  /* Use the safe version if safeMode is on */
  if (this.safeMode) {
    return this.updateSafe(query, changes, options);
  }

  /* Set default options, fail on attempted upsert */
  options = _.assign({ }, options, defaults);
  if (options.upsert) {
    throw new Error('Upsert is only available with safe mode.');
  }

  /* Find all maching documents and record their IDs */
  let matches = await this.collection.find(query, { fields: { _id: true } }).toArray();
  matches = _.map(matches, '_id');
  if (matches.length === 0) { return 0; }

  /* Drop all of them from cache */
  matches.forEach(i => this.cache.del(i));

  /* Execute the update */
  query = { _id: { $in: matches } };
  const write = await this.collection.updateMany(query, changes, options);

  /* If updated document count does not match the number of IDs, data must
   * have been modified; drop entire cache just to be safe. */
  /* istanbul ignore if */
  if (write.modifiedCount !== matches.length) {
    Debug('ModifiedCount mismatch, dropping all cache just to be safe.');
    this.cache.reset();
  }

  return write.modifiedCount;
}


/**
 * Updates multiple records and drops entire cache.
 * This operation is atomic and uses only one query.
 *
 * @param     {object}       MongoDB query of documents to modify.
 * @param     {object}       Changes to apply to the documents.
 * @return    {number}       Number of updated documents.
 */
async function safe(query, changes, options) {
  options = _.assign({ }, options, defaults);

  const write = await this.collection.updateMany(query, changes, options);
  this.cache.reset();
  return write.modifiedCount;
}


/**
 * Exports
 */
module.exports = { one, many, safe };
