/**
 * find.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import ObjectID    from './objectid';


/**
 * Finds a document by its ID, utilizing cache if possible.
 *
 * @param     {ObjectID}     ID of the document to search for.
 * @return    {object}       Document with the ID.
 */
export async function byId(id) {

  const cached = this.cache.get(id);
  if (cached) { return cached; }

  const query = { _id: ObjectID(id) };
  const result = await this.collection.findOne(query);
  return this.cache.set(result);

}


/**
 * Find multiple documents.
 * MongoStash does not cache by query.
 *
 * @param     {object}       MongoDB query.
 * @param     {object}       MongoDB projection.
 * @return    {array}        The array of matching documents.
 */
export async function list(query, projection) {
  query = query || { };
  projection = projection || this.projection;

  const result = await this.collection.find(query, projection).toArray();
  return result;
}


/**
 * Find one document.
 * MongoStash does not cache by query.
 *
 * @param     {object}       MongoDB query.
 * @param     {object}       MongoDB projection.
 * @return    {object}       The matching document.
 */
export async function one(query, projection) {
  query = query || { };
  projection = projection || this.projection;

  const result = await this.collection.findOne(query, projection);
  return result;
}
