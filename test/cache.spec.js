/**
 * test/cache.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const LruCache     = require('lru-cache');
const ObjectID     = require('bson-objectid');
const expect       = require('chai').expect;
const Sinon        = require('sinon');
const Stash        = require('../lib');


/*!
 * Setup testing infrastructure
 */
before(function() {
  LruCache.prototype._get = LruCache.prototype.get;
  LruCache.prototype._set = LruCache.prototype.set;
  LruCache.prototype._del = LruCache.prototype.del;
});

after(function() {
  LruCache.prototype.get = LruCache.prototype._get;
  LruCache.prototype.set = LruCache.prototype._set;
  LruCache.prototype.del = LruCache.prototype._del;
});

beforeEach(function() {
  this.stash = new Stash(null);
  this.cache = this.stash.cache;
  LruCache.prototype.get = Sinon.spy(LruCache.prototype._get);
  LruCache.prototype.set = Sinon.spy(LruCache.prototype._set);
  LruCache.prototype.del = Sinon.spy(LruCache.prototype._del);
});


/*!
 * Test cases start here
 */
it('should wrap the LruCache.get', function() {
  const id = ObjectID();

  this.cache.get(id);
  expect(LruCache.prototype.get)
    .to.be.calledOnce.and
    .to.be.calledWith(id.toString());
});

it('should wrap the LruCache.set', function(done) {
  const cb = () => done();
  this.stash.on('cache.set', cb);

  const value = { _id: ObjectID() };

  this.cache.set(value);
  expect(LruCache.prototype.set)
    .to.be.calledOnce.and
    .to.be.calledWith(value._id.toString(), value);

  const actual = this.cache.get(value._id);
  expect(actual).to.equal(value);

});

it('should wrap the LruCache.del', function(done) {
  const cb = () => done();
  this.stash.on('cache.del', cb);

  const value = { _id: ObjectID() };

  this.cache.set(value);

  const actual = this.cache.get(value._id);
  expect(actual).to.equal(value);

  this.cache.del(value._id);
  expect(LruCache.prototype.del)
    .to.be.calledOnce.and
    .to.be.calledWith(value._id.toString());

  const another = this.cache.get(value._id);
  expect(another).not.to.exist;

});

it('should not call set if value is null or has no ID', function() {
  const value = { };

  this.cache.set(value);

  expect(LruCache.prototype.set)
    .to.have.callCount(0);
});
