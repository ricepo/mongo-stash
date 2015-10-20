/**
 * test/update.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const _            = require('lodash');
const Sinon        = require('sinon');
const expect       = require('chai').expect;
const ObjectID     = require('bson-objectid');
const Bluebird     = require('bluebird');

const MongoStash   = require('../lib/index.js');


/*!
 * Setup testing infrastructure
 */
beforeEach(function() {
  this.collection.findOne = Sinon.spy(this.collection.findOne);
  this.collection.findOneAndUpdate = Sinon.spy(this.collection.findOneAndUpdate);
  this.collection.updateMany = Sinon.spy(this.collection.updateMany);

  this.stash = new MongoStash(this.collection);
});


/*!
 * Test cases start
 */
describe('updateOne(2)', function() {

  it('should update single entry by ID', function*() {
    const value = this.data[37];
    const changes = { $set: { foo: 'bar' } };

    const result = yield this.stash.updateOne(value._id, changes);
    expect(result)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOneAndUpdate)
      .to.be.calledOnce;
    const args = this.collection.findOneAndUpdate.firstCall.args;
    expect(args)
      .to.have.length(3);
    expect(args[0])
      .to.deep.equal({ _id: value._id });
    expect(args[1])
      .to.deep.equal({ $set: { foo: 'bar' } });
    expect(args[2])
      .to.deep.equal({ returnOriginal: false });

    const verify = yield this.stash.findById(value._id);
    expect(this.collection.findOne)
      .to.have.callCount(0);
    expect(verify)
      .to.have.property('foo', 'bar');

  });

  it('should replace the cached value', function*() {
    const value = this.data[41];
    const changes = { $set: { foo: 'bar' } };

    yield this.stash.findById(value._id);
    expect(this.stash.cache.has(value._id.toString()))
      .to.be.true;

    yield this.stash.updateOne(value._id, changes);
    expect(this.stash.cache.has(value._id.toString()))
      .to.be.true;

    const result = yield this.stash.findById(value._id);
    expect(this.collection.findOne)
      .to.be.calledOnce;
    expect(result)
      .to.have.property('foo', 'bar');

  });

  it('should apply options', function*() {
    const value = { _id: ObjectID() };
    const changes = { $set: { foo: 'bar' } };
    const options = { upsert: true };

    const result = yield this.stash.updateOne(value._id, changes, options);
    expect(result)
      .to.exist
      .to.have.property('foo', 'bar');
    expect(this.collection.findOneAndUpdate)
      .to.be.calledOnce;
    const args = this.collection.findOneAndUpdate.firstCall.args;
    expect(args)
      .to.have.length(3);
    expect(args[2])
      .to.deep.equal({ returnOriginal: false, upsert: true });

    const verify = yield this.stash.findById(value._id);
    expect(this.collection.findOne)
      .to.have.callCount(0);
    expect(verify)
      .to.exist
      .to.have.property('foo', 'bar');

  });

});


describe('updateMany(3)', function() {

  it('should update multiple entries', function*() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    const count = yield this.stash.updateMany(query, changes);

    const verify = yield this.stash.find(query);
    expect(verify)
      .to.have.length(count);

    verify.forEach(i => expect(i).to.have.property('foo', 'bar'));
  });

  it('should drop matched itmes from cache', function*() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    /* Make stash cache some IDs */
    yield this.stash.findById(this.data[0]._id);
    yield this.stash.findById(this.data[10]._id);
    yield this.stash.findById(this.data[19]._id);
    yield this.stash.findById(this.data[22]._id);

    /* Execute update operation */
    yield this.stash.updateMany(query, changes);

    /* Check if items are dropped; unmatched should remain cached */
    const actual1 = yield this.stash.findById(this.data[0]._id);
    expect(actual1)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(5);

    const actual2 = yield this.stash.findById(this.data[10]._id);
    expect(actual2)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(6);

    const actual3 = yield this.stash.findById(this.data[19]._id);
    expect(actual3)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(7);

    const actual4 = yield this.stash.findById(this.data[22]._id);
    expect(actual4)
      .not.to.have.property('foo');
    expect(this.collection.findOne)
      .to.have.callCount(7);

  });

  it('should take shortcut when nothing matches', function*() {
    const result = yield this.stash.updateMany({ _id: 'foo' });
    expect(result)
      .to.equal(0);
    expect(this.collection.updateMany)
      .to.have.callCount(0);
  });

  it('should throw when using upsert', function() {
    const promise = this.stash.updateMany({ }, { }, { upsert: true });
    expect(promise)
      .to.be.rejectedWith('Upsert is only available with safe mode.');
  });

});


describe('updateSafe(3)', function() {

  it('should update multiple entries', function*() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    const count = yield this.stash.updateSafe(query, changes);

    const verify = yield this.stash.find(query);
    expect(verify)
      .to.have.length(count);

    verify.forEach(i => expect(i).to.have.property('foo', 'bar'));
  });

  it('should drop all itmes from cache', function*() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    /* Make stash cache some IDs */
    yield this.stash.findById(this.data[0]._id);
    yield this.stash.findById(this.data[10]._id);
    yield this.stash.findById(this.data[19]._id);
    yield this.stash.findById(this.data[22]._id);

    /* Execute update operation */
    yield this.stash.updateSafe(query, changes);

    /* Check if items are dropped; unmatched should remain cached */
    const actual1 = yield this.stash.findById(this.data[0]._id);
    expect(actual1)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(5);

    const actual2 = yield this.stash.findById(this.data[10]._id);
    expect(actual2)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(6);

    const actual3 = yield this.stash.findById(this.data[19]._id);
    expect(actual3)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(7);

    const actual4 = yield this.stash.findById(this.data[22]._id);
    expect(actual4)
      .not.to.have.property('foo');
    expect(this.collection.findOne)
      .to.have.callCount(8);

  });

});
