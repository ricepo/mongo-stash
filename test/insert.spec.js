/**
 * test/insert.spec.js
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
  this.value = { _id: ObjectID() };
  this.values = [ this.value, { _id: ObjectID() } ];

  this.collection = {
    insertOne: Sinon.spy(function(doc) {
      return Bluebird.resolve({ result: { ops: [doc] } });
    }),
    insertMany: Sinon.spy(function(docs) {
      return Bluebird.resolve({ result: { ops: docs } });
    })
  };
  this.stash = MongoStash(this.collection);
});


/**
 * Test cases
 */
describe('insertOne(2)', function() {

  it('should insert a document', function() {
    this.stash.defaults = Sinon.spy(function(doc) { return { foo: doc._id }; });
    const promise = this.stash.insertOne(this.value);

    return promise.then(result => {
      expect(result).to.have.property('foo');
      expect(this.stash.cache.has(this.value._id.toString())).to.be.true;
      expect(this.collection.insertOne).to.be.calledOnce;
      expect(this.stash.defaults).to.be.calledOnce.and.calledWith(this.value);
    });
  });

  it('should apply object defaults', function() {
    this.stash.defaults = { foo: 'bar' };
    const promise = this.stash.insertOne(this.value, undefined);

    return promise.then(result => {
      expect(result).to.have.property('foo', 'bar');
    });
  });

  it('should apply options', function() {
    const options = { };
    const promise = this.stash.insertOne(this.value, options);

    return promise.then(result => {
      expect(result).to.exist;
      expect(this.collection.insertOne)
        .to.be.calledOnce.and
        .to.be.calledWith(this.value, options);
    });
  });

});

describe('insertMany(2)', function() {

  it('should insert multiple documents', function() {
    this.stash.defaults = Sinon.spy(function(doc) { return { foo: doc._id }; });
    const promise = this.stash.insertMany(this.values);

    return promise.then(results => {
      expect(results).to.have.length(2);

      this.values.forEach(v => {
        expect(this.stash.cache.has(v._id.toString())).to.be.true;
      });

      expect(this.collection.insertMany).to.be.calledOnce;
      const args = this.collection.insertMany.firstCall.args;
      expect(args).to.have.length(2);
      expect(args[0]).to.be.an('array').and.have.length(this.values.length);
      expect(args[1]).to.be.null;

      args[0].forEach((v, i) => {
        expect(v).to.have.property('foo', this.values[i]._id);
      });
    });
  });

  it('should apply object defaults', function() {
    this.stash.defaults = { foo: 'bar' };
    const promise = this.stash.insertMany(this.values, undefined);

    return promise.then(() => {
      expect(this.collection.insertMany).to.be.calledOnce;
      const args = this.collection.insertMany.firstCall.args;
      expect(args).to.have.length(2);
      expect(args[0]).to.be.an('array').and.have.length(this.values.length);
      expect(args[1]).to.be.null;

      args[0].forEach(v => expect(v).to.have.property('foo', 'bar'));
    });
  });

  it('should apply options', function() {
    const options = { };
    const promise = this.stash.insertMany(this.values, options);

    return promise.then(() => {
      expect(this.collection.insertMany).to.be.calledOnce;
      const args = this.collection.insertMany.firstCall.args;
      expect(args).to.have.length(2);
      expect(args[1]).to.equal(options);
    });
  });


});
