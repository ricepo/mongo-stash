/**
 * cache.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import LruCache    from 'lru-cache';

/**
 * get(1)
 */
export function get(id) {
  return LruCache.prototype.get.call(this, id.toString());
}


/**
 * set(1)
 */
export function set(obj, age) {
  if (!obj || !obj._id) { return obj; }
  LruCache.prototype.set.call(this, obj._id.toString(), obj, age);
  return obj;
}


/**
 * del(1)
 */
export function del(id) {
  return LruCache.prototype.del.call(this, id.toString());
}


/**
 * Default export, creates a patched LRU cache.
 */
export default function cache(options) {
  const lru = LruCache(options);
  lru.get = get;
  lru.set = set;
  lru.del = del;
  return lru;
}
