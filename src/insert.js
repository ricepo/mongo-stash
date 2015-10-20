/**
 * insert.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';


/**
 * Inserts one document into the collection.
 *
 * @param     {object}       Document to insert.
 * @param     {object}       Optional settings.
 * @return    {Promise}      Resolves with inserted document if successful.
 */
export async function one(doc, options = null) {

  /* We don't support returnOriginal option here */
  if (options && options.returnOriginal) {
    throw new Error('returnOriginal option is not supported.');
  }

  /* Merge with defaults */
  let defaults = this.defaults;
  if (typeof defaults === 'function') { defaults = defaults(doc); }
  doc = _.merge({ }, defaults, doc);

  /* Insert the document, cache it, and return it */
  const write = await this.collection.insertOne(doc, options);
  const entry = write.ops[0];
  return this.cache.set(entry);

}


/**
 * Inserts one document into the collection.
 *
 * @param     {object}       Document to insert.
 * @param     {object}       Optional settings.
 * @return    {Promise}      Resolves with inserted document if successful.
 */
export async function many(items, options = null) {

  /* Merge with defaults */
  const isFunc = (typeof this.defaults === 'function');
  items = items.map(item =>
    _.merge({ }, isFunc ? this.defaults(item) : this.defaults, item)
  );

  /* Insert items, cache them, and return them */
  const write = await this.collection.insertMany(items, options);
  const entries = write.ops;
  entries.forEach(entry => this.cache.set(entry));
  return entries;

}
