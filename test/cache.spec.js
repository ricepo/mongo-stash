/**
 * test/cache.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const _            = require('lodash');
const ObjectID     = require('bson-objectid');
const Cache        = require('../src/cache');

const context = {
  emit: _.noop(),
  collectionName: 'test',
  redis: {
    getAsync: _.noop(),
    set: _.noop(),
    delete: _.noop(),
    flushall: _.noop()
  }
};

beforeEach(function() {
  context.emit = Sinon.stub();
  context.redis.getAsync = Sinon.stub().resolves('{}');
  context.redis.set = Sinon.stub();
  context.redis.del = Sinon.stub();
  context.redis.flushall = Sinon.stub();

  this.cache = Cache(context, 346700);

});


/*!
 * Test cases start here
 */
it('should call redis get function', async function() {
  const id = ObjectID();
  const key = `test_${id.toString()}`;

  const result = await this.cache.get(id);
  expect(context.redis.getAsync)
    .to.be.calledOnce.and
    .to.be.calledWith(key);

  expect(result).to.deep.equal({ });

});

it('should call redis set function', async function() {

  const value = { _id: ObjectID() };
  const key = `test_${value._id.toString()}`;


  this.cache.set(value);
  expect(context.redis.set)
    .to.be.calledOnce.and
    .to.be.calledWith(key, JSON.stringify(value), 'PX', 346700);

});

it('should call the redis del function', function() {

  const id = ObjectID();
  const key = `test_${id.toString()}`;

  this.cache.del(id);

  expect(context.redis.del)
    .to.be.calledOnce.and
    .to.be.calledWith(key);


});

it('should call flushall function  of redis', function() {


  this.cache.reset();
  expect(context.redis.flushall)
    .to.be.calledOnce;

});

it('should not call set if value is null or has no ID', function() {
  const value = { };

  this.cache.set(value);

  expect(context.redis.set)
    .to.have.callCount(0);
});
