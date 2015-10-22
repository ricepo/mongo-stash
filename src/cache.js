/**
 * cache.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import _           from 'lodash';
import LruCache    from 'lru-cache';

/**
 * get(1)
 */
export function get(stash, id) {
  return LruCache.prototype.get.call(this, id.toString());
}


/**
 * set(1)
 */
export function set(stash, obj, age) {
  if (!obj || !obj._id) { return obj; }
  LruCache.prototype.set.call(this, obj._id.toString(), obj, age);
  return obj;
}


/**
 * del(1)
 */
export function del(stash, id) {
  return LruCache.prototype.del.call(this, id.toString());
}


/**
 * Default export, creates a patched LRU cache.
 */
export default function cache(stash, options) {
  const lru = LruCache(options);
  lru.get = _.partial(get, stash);
  lru.set = _.partial(set, stash);
  lru.del = _.partial(del, stash);
  return lru;
}
