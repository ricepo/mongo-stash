/**
 * test/find.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Sinon        = require('sinon');
const expect       = require('chai').expect;

const MongoStash   = require('../lib/index.js');

/*!
 * Setup testing infrastructure
 */
beforeEach(function() {
  this.collection.findOne = Sinon.spy(this.collection.findOne);
  this.collection.find = Sinon.spy(this.collection.find);

  this.stash = MongoStash(this.collection);
});


/*!
 * Test cases
 */

describe('findById(1)', function() {

  it('should find the value by ID', function*() {
    const value = this.data[0];
    const result = yield this.stash.findById(value._id);

    /* Check if result is good */
    expect(result).to.have.property('index', value.index);

    /* Check if the native driver was called correctly */
    expect(this.collection.findOne).to.be.calledOnce;
    const args = this.collection.findOne.firstCall.args;
    expect(args).to.have.length(1);
    expect(args[0]).to.deep.equal({ _id: value._id });

    /* Expect cache to have the value */
    expect(this.stash.cache.has(value._id.toString())).to.be.true;
  });

  it('should use cache when available', function*() {
    const value = this.data[10];
    const result = yield this.stash.findById(value._id);

    /* Check if result is good */
    expect(result).to.have.property('index', value.index);
    expect(this.collection.findOne).to.be.calledOnce;

    /* Retrieve the value again, then check if it was cached */
    const another = yield this.stash.findById(value._id);
    expect(another).to.have.property('index', value.index);
    expect(this.collection.findOne).to.be.calledOnce;

  });

});

describe('find(2)', function() {

  it('should find entries matching the query', function*() {
    const result = yield this.stash.find({ index: { $lt: 20 } }, { fields: { index: true } });

    expect(result).to.have.length(20);
    expect(this.collection.find).to.be.calledOnce;
    const args = this.collection.find.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ index: { $lt: 20 } });
    expect(args[1]).to.deep.equal({ fields: { index: true } });
  });

  it('should apply default projection', function*() {
    this.stash.projection = { fields: { index: true } };
    yield this.stash.find();

    expect(this.collection.find).to.be.calledOnce;
    const args = this.collection.find.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ });
    expect(args[1]).to.deep.equal({ fields: { index: true } });
  });

  it('should apply default query', function*() {
    const results = yield this.stash.find();

    expect(results).to.have.length(100);
  });

});

describe('findOne(2)', function() {

  it('should call the MongoDB findOne()', function*() {
    const result = yield this.stash.findOne({ index: 19 });

    expect(result).to.have.property('index', 19);
    expect(this.collection.findOne).to.be.calledOnce;
    const args = this.collection.findOne.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ index: 19 });
    expect(args[1]).to.deep.equal({ });
  });

  it('should apply default projection', function*() {
    this.stash.projection = { fields: { index: false } };
    const result = yield this.stash.findOne({ index: 21 });

    expect(result).not.to.have.property('index');
    expect(this.collection.find).to.be.calledOnce;
    const args = this.collection.find.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ index: 21 });
    expect(args[1]).to.deep.equal({ fields: { index: false } });
  });

  it('should apply default query', function*() {
    const results = yield this.stash.findOne();

    expect(results).to.exist;
  });

});
