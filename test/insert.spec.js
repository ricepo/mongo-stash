/**
 * test/insert.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const ObjectID     = require('bson-objectid');
const MongoStash   = dofile('index');


/*!
 * Setup testing infrastructure
 */
beforeEach(async function() {
  this.collection.findOne = Sinon.spy(this.collection.findOne);
  this.collection.insertOne = Sinon.spy(this.collection.insertOne);
  this.collection.insertMany = Sinon.spy(this.collection.insertMany);

  this.value = { _id: ObjectID(), index: 999 };
  this.values = [
    { _id: ObjectID(), index: 100 },
    { _id: ObjectID(), index: 101 },
    { _id: ObjectID(), index: 102 },
    { _id: ObjectID(), index: 103 }
  ];

  this.stash = MongoStash(this.collection);
});


/**
 * Test cases
 */
describe('insertOne(2)', async function() {

  it('should insert a document', async function() {
    const result = await this.stash.insertOne(this.value);

    expect(result).to.have.property('index', 999);

    const verify = await this.collection.findOne({ _id: this.value._id });
    expect(verify).to.exist.and.to.have.property('index', 999);

  });

  it('should correctly apply defaults callback', async function() {
    this.stash.defaults = Sinon.spy(doc => ({ foo: doc._id }));

    const result = await this.stash.insertOne(this.value);
    expect(this.stash.defaults)
      .to.be.calledOnce
      .to.be.calledWith(this.value);
    expect(result)
      .to.have.property('foo');
    expect(result)
      .to.have.property('index', 999);

    const verify = await this.collection.findOne({ _id: this.value._id });
    expect(verify)
      .to.exist
      .to.have.property('foo');
    expect(verify)
      .to.have.property('index', 999);
  });

  it('should correctly apply defaults object', async function() {
    this.stash.defaults = { foo: 'bar' };

    const result = await this.stash.insertOne(this.value);
    expect(result)
      .to.have.property('foo', 'bar');
    expect(result)
      .to.have.property('index', 999);

    const verify = await this.collection.findOne({ _id: this.value._id });
    expect(verify)
      .to.exist
      .to.have.property('foo', 'bar');
    expect(verify)
      .to.have.property('index', 999);
  });

  it('should apply options', async function() {
    const options = { };

    const result = await this.stash.insertOne(this.value, options);
    expect(result).to.exist;
    expect(this.collection.insertOne)
      .to.be.calledOnce.and
      .to.be.calledWith(this.value, options);

  });

  it('should throw when returnOriginal = true', async function() {
    const promise = this.stash.insertOne({ }, { returnOriginal: true });
    expect(promise)
      .to.be.rejectedWith('returnOriginal option is not supported.');
  });

  it('should add inserted document to cache', async function() {
    const result = await this.stash.insertOne(this.value);
    expect(result)
      .to.exist;

    const verify = await this.stash.findById(this.value._id);
    expect(verify)
      .to.have.property('index', this.value.index);
    expect(this.collection.findOne)
      .to.have.callCount(0);
  });

  it('should support string IDs', async function() {
    this.value._id = 'foobar123';
    const result = await this.stash.insertOne(this.value);

    expect(result).to.have.property('index', 999);

    const verify = await this.stash.findById('foobar123');
    expect(verify)
      .to.exist
      .to.have.property('index', 999);
    expect(verify)
      .to.have.property('_id', 'foobar123');
  });

});

describe('insertMany(2)', async function() {

  it('should insert multiple documents', async function() {
    const results = await this.stash.insertMany(this.values);

    expect(results)
      .to.have.length(this.values.length);

    expect(this.collection.insertMany)
      .to.be.calledOnce;
    const args = this.collection.insertMany.firstCall.args;
    expect(args)
      .to.have.length(2);
    expect(args[0])
      .to.be.an('array')
      .and.have.length(this.values.length);
    expect(args[1])
      .to.be.null;
  });

  it('should apply defaults async function', async function() {
    this.stash.defaults = Sinon.spy(i => ({ foo: i.index }));

    const results = await this.stash.insertMany(this.values);
    expect(results)
      .to.have.length(this.values.length);
    results.forEach(i => expect(i).to.have.property('foo', i.index));

  });

  it('should apply object defaults', async function() {
    this.stash.defaults = { foo: 'bar' };

    const results = await this.stash.insertMany(this.values, undefined);
    expect(results)
      .to.have.length(this.values.length);
    results.forEach(i => expect(i).to.have.property('foo', 'bar'));
  });

  it('should apply options', async function() {
    const options = { };
    await this.stash.insertMany(this.values, options);

    expect(this.collection.insertMany).to.be.calledOnce;
    const args = this.collection.insertMany.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[1]).to.equal(options);
  });

});
