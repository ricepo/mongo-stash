/**
 * test/find.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const MongoStash   = dofile('index');
const redis        = {
  getAsync: Sinon.stub(),
  set: Sinon.stub(),
  del: Sinon.stub(),
  reset: Sinon.stub()
};


/*!
 * Setup testing infrastructure
 */
beforeEach(async function() {

  this.collection.findOne = Sinon.spy(this.collection.findOne);
  this.collection.find = Sinon.spy(this.collection.find);

  this.stash = MongoStash(this.collection, redis);
});


/*!
 * Test cases
 */

describe('findById(1)', async function() {

  it('should find the value by ID', async function() {

    const value = this.data[0];

    /* No cached is saved */
    redis.getAsync.resolves(null);
    redis.set.returns(value);
    const result = await this.stash.findById(value._id);

    /* Check if result is good */
    expect(result).to.have.property('index', value.index);

    /* Check if the native driver was called correctly */
    expect(this.collection.findOne).to.be.calledOnce;
    expect(redis.set).to.be.calledOnce;
    const args = this.collection.findOne.firstCall.args;
    expect(args).to.have.length(1);
    expect(args[0]).to.deep.equal({ _id: value._id });

  });

  it('should use cache when available', async function() {
    const value = this.data[10];

    /* Get the cached value */
    redis.getAsync.resolves(JSON.stringify(value));
    const result = await this.stash.findById(value._id);

    /* Check if result is good */
    expect(result).to.have.property('index', value.index);
    expect(this.collection.findOne).not.to.be.called;

  });

  it('should clone the object if retrieving from cache', async function() {
    const value = this.data[10];

    /* No cached is saved */
    redis.getAsync.resolves(null);
    redis.set.returns(value);

    const result = await this.stash.findById(value._id);

    /* Check if result is good */
    expect(result).to.have.property('index', value.index);
    expect(this.collection.findOne).to.be.calledOnce;

    /* Mutate the object */
    result.foo = 'bar';

    /* Retrieve the value again, then check if it was cached */
    const another = await this.stash.findById(value._id);
    expect(another).not.to.have.property('foo');
  });

});

describe('find(2)', async function() {

  it('should find entries matching the query', async function() {
    const result = await this.stash.find({ index: { $lt: 20 } }, { fields: { index: true } });

    expect(result).to.have.length(20);
    expect(this.collection.find).to.be.calledOnce;
    const args = this.collection.find.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ index: { $lt: 20 } });
    expect(args[1]).to.deep.equal({ fields: { index: true } });
  });

  it('should apply default projection', async function() {
    this.stash.projection = { fields: { index: true } };
    await this.stash.find();

    expect(this.collection.find).to.be.calledOnce;
    const args = this.collection.find.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ });
    expect(args[1]).to.deep.equal({ fields: { index: true } });
  });

  it('should apply default query', async function() {
    const results = await this.stash.find();

    expect(results).to.have.length(100);
  });

});

describe('findOne(2)', async function() {

  it('should call the MongoDB findOne()', async function() {
    const result = await this.stash.findOne({ index: 19 });

    expect(result).to.have.property('index', 19);
    expect(this.collection.findOne).to.be.calledOnce;
    const args = this.collection.findOne.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ index: 19 });
    expect(args[1]).to.deep.equal({ });
  });

  it('should apply default projection', async function() {
    this.stash.projection = { fields: { index: false } };
    const result = await this.stash.findOne({ index: 21 });

    expect(result).not.to.have.property('index');
    expect(this.collection.find).to.be.calledOnce;
    const args = this.collection.find.firstCall.args;
    expect(args).to.have.length(2);
    expect(args[0]).to.deep.equal({ index: 21 });
    expect(args[1]).to.deep.equal({ fields: { index: false } });
  });

  it('should apply default query', async function() {
    const results = await this.stash.findOne();

    expect(results).to.exist;
  });

});
