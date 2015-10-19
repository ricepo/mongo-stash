/**
 * test/find.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Sinon        = require('sinon');
const expect       = require('chai').expect;
const ObjectID     = require('bson-objectid');
const Bluebird     = require('bluebird');

const MongoStash   = require('../lib/index.js');

/*!
 * Setup testing infrastructure
 */
beforeEach(function() {
  const value = this.value = { _id: ObjectID() };
  this.collection = {
    findOne: Sinon.spy(function() { return Bluebird.resolve(value); }),
    find: Sinon.spy(function() {
      return { toArray: function() { return Bluebird.resolve([value]); } };
    })
  };
  this.stash = MongoStash(this.collection);
});


/*!
 * Test cases
 */

describe('findById(1)', function() {

  it('should find the value by ID', function() {
    const promise = this.stash.findById(this.value._id);

    return promise.then((result) => {
      expect(result).to.equal(this.value);
      expect(this.collection.findOne).to.be.calledOnce;
      expect(this.stash.cache.has(this.value._id.toString())).to.be.true;
    });
  });

  it('should use cache when available', function() {
    this.stash.cache.set(this.value);
    const promise = this.stash.findById(this.value._id);

    return promise.then((result) => {
      expect(result).to.equal(this.value);
      expect(this.collection.findOne).to.have.callCount(0);
    });
  });

});

describe('find(2)', function() {

  it('should call the MongoDB find()', function() {
    const promise = this.stash.find();

    return promise.then(result => {
      expect(result).to.have.length(1);
      expect(this.collection.find).to.be.calledOnce;
    });
  });

});

describe('findOne(2)', function() {

  it('should call the MongoDB findOne()', function() {
    const promise = this.stash.findOne();

    return promise.then(result => {
      expect(result).to.equal(this.value);
      expect(this.collection.findOne).to.be.calledOnce;
    });
  });

});
