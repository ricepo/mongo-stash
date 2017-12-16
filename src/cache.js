/**
 * cache.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');
// const LruCache     = require('lru-cache');


/**
 * get(1)
 */
function get(stash, client, id) {

  console.log('client =>', client);
  // const result = LruCache.prototype.get.call(this, id.toString());
  // return _.cloneDeep(result);
  client.set('test', 'test');
  client.get(id.toString(), (err, reply) => {
    console.log(reply);
  });
  client.get('test', (err, reply) => {
    console.log(reply);
  });

  // return JSON.parse(result);
}


/**
 * set(1)
 */
function set(stash, client, obj, age) {

  console.log('obj=> ', obj);
  console.log('client =>', client);
  // if (!obj || !obj._id) { return obj; }
  // LruCache.prototype.set.call(this, obj._id.toString(), obj, age);
  // stash.emit('cache.set', obj._id);
  // return _.cloneDeep(obj);

  client.set(obj._id.toString(), JSON.stringify(obj), 'PX', age);
  return _.cloneDeep(obj);
}


/**
 * del(1)
 */
function del(stash, client, id) {
  // const result = LruCache.prototype.del.call(this, id.toString());
  // stash.emit('cache.del', id);
  // return result;

  const result = client.del(id.toString());
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
  lru.get = _.partial(get, stash, client);
  lru.set = _.partial(set, stash, client);
  lru.del = _.partial(del, stash, client);
  lru.reset = _.partial(reset, stash, client);
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
