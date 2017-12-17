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
async function get(stash, client, name, id) {

  // const name = await stash.collectionName.then(res => res);

  // let result = null;
  // const result = LruCache.prototype.get.call(this, id.toString());
  // return _.cloneDeep(result);

  const key = `${name}_${id.toString()}`;

  const result = await client
    .getAsync(key)
    .then((res) => res);

  return JSON.parse(result);
}


/**
 * set(1)
 */
function set(stash, client, name, obj) {

  // if (!obj || !obj._id) { return obj; }
  // LruCache.prototype.set.call(this, obj._id.toString(), obj, age);
  // stash.emit('cache.set', obj._id);
  // return _.cloneDeep(obj);

  if (!obj || !obj._id) { return obj; }

  const key = `${name}_${obj._id.toString()}`;
  client.set(key, JSON.stringify(obj), 'PX', 86400000);
  stash.emit('cache.set', obj._id);
  return _.cloneDeep(obj);
}


/**
 * del(1)
 */
function del(stash, client, name, id) {
  // const result = LruCache.prototype.del.call(this, id.toString());
  // stash.emit('cache.del', id);
  // return result;

  const key = `${name}_${id.toString()}`;

  const result = client.del(key);
  stash.emit('cache.del', id);
  return result;
}


/**
 * reset(0)
 */
function reset(stash, client) {
  // LruCache.prototype.reset.call(this);

  client.flushall();
  stash.emit('cache.reset');
}


/**
 * Default export, creates a patched LRU cache.
 */
function cache(stash, client) {

  const lru = {};
  const name = _.get(stash.collection, 's.name');
  lru.get = _.partial(get, stash, client, name);
  lru.set = _.partial(set, stash, client, name);
  lru.del = _.partial(del, stash, client, name);
  lru.reset = _.partial(reset, stash, client, name);
  return lru;
}


/**
 * Export the stuff
 */
module.exports = cache;
module.exports.get = get;
module.exports.set = set;
module.exports.del = del;
module.exports.reset = reset;
