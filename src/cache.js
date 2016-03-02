/**
 * cache.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');
const LruCache     = require('lru-cache');


/**
 * get(1)
 */
function get(stash, id) {
  return LruCache.prototype.get.call(this, id.toString());
}


/**
 * set(1)
 */
function set(stash, obj, age) {
  if (!obj || !obj._id) { return obj; }
  LruCache.prototype.set.call(this, obj._id.toString(), obj, age);
  stash.emit('cache.set', obj._id);
  return obj;
}


/**
 * del(1)
 */
function del(stash, id) {
  const result = LruCache.prototype.del.call(this, id.toString());
  stash.emit('cache.del', id);
  return result;
}


/**
 * reset(0)
 */
function reset(stash) {
  LruCache.prototype.reset.call(this);
  stash.emit('cache.reset');
}


/**
 * Default export, creates a patched LRU cache.
 */
function cache(stash, options) {
  const lru = LruCache(options);
  lru.get = _.partial(get, stash);
  lru.set = _.partial(set, stash);
  lru.del = _.partial(del, stash);
  lru.reset = _.partial(reset, stash);
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
