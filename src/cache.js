/**
 * cache.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');


/**
 * get(1)
 */
async function get(stash, id) {

  /* Create key using collection name and id */
  const name = stash.collectionName;
  const key = `${name}_${id.toString()}`;

  /* Initialise result as null */
  let result = null;

  /* Get the cached value */
  result = await stash.redis.getAsync(key);

  /* parse string */
  return JSON.parse(result);
}


/**
 * set(1)
 */
function set(stash, age, obj) {

  /* check if object or id is null */
  if (!obj || !obj._id) { return obj; }

  /* Create key using collection name and id */
  const name = stash.collectionName;
  const key = `${name}_${obj._id.toString()}`;

  /* Set cached with expiration of 24 hours */
  stash.redis.set(key, JSON.stringify(obj), 'PX', age);

  /* Emit cache set event */
  stash.emit('cache.set', obj._id);

  return _.cloneDeep(obj);
}


/**
 * del(1)
 */
function del(stash, id) {

  /* Create key using collection name and id */
  const name = stash.collectionName;
  const key = `${name}_${id.toString()}`;

  /* Delete the cache */
  const result = stash.redis.del(key);

  /* Emit event about delete cache */
  stash.emit('cache.del', id);

  return result;
}


/**
 * reset(0)
 */
function reset(stash) {

  /* Flush all cached */
  stash.redis.flushall();

  /* Emit cache reset */
  stash.emit('cache.reset');
}


/**
 * Default export, creates a patched LRU cache.
 */
function cache(stash, age) {

  /* Initialise redisCache */
  const redisCache = {};

  redisCache.get = _.partial(get, stash);
  redisCache.set = _.partial(set, stash, age);
  redisCache.del = _.partial(del, stash);
  redisCache.reset = _.partial(reset, stash);
  return redisCache;
}


/**
 * Export the stuff
 */
module.exports = cache;
module.exports.get = get;
module.exports.set = set;
module.exports.del = del;
module.exports.reset = reset;
