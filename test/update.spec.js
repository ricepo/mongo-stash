/**
 * test/update.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const ObjectID     = require('bson-objectid');
const MongoStash   = dofile('index');
const redis        = {
  getAsync: Sinon.stub(),
  set: Sinon.stub(),
  del: Sinon.stub(),
  flushall: Sinon.stub()
};

/*!
 * Setup testing infrastructure
 */
beforeEach(async function() {
  this.collection.findOne = Sinon.spy(this.collection.findOne);
  this.collection.findOneAndUpdate = Sinon.spy(this.collection.findOneAndUpdate);
  this.collection.updateMany = Sinon.spy(this.collection.updateMany);

  this.stash = new MongoStash(this.collection, redis);
  this.stash.updateSafe = Sinon.spy(this.stash.updateSafe);
});


/*!
 * Test cases start
 */
describe('updateOne(2)', async function() {

  it('should update single entry by ID', async function() {
    const value = this.data[37];
    const changes = { $set: { foo: 'bar' } };

    redis.set.returns({ foo: 'bar' });
    const result = await this.stash.updateOne(value._id, changes);
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
      .to.deep.equal({
        $set: { foo: 'bar' }
      });
    expect(args[2])
      .to.deep.equal({ returnOriginal: false });

    redis.getAsync.resolves(JSON.stringify({ foo: 'bar' }));
    const verify = await this.stash.findById(value._id);
    expect(this.collection.findOne)
      .to.have.callCount(0);
    expect(verify)
      .to.have.property('foo', 'bar');

  });

  it('should replace the cached value', async function() {
    const value = this.data[41];
    const changes = { $set: { foo: 'bar' } };

    redis.getAsync.resolves(JSON.stringify(value));
    const result1 = await this.stash.findById(value._id);

    expect(result1.index).to.be.equal(value.index);

    redis.set.returns({ foo: 'bar' });
    await this.stash.updateOne(value._id, changes);

    redis.getAsync.resolves(null);
    redis.set.returns({ foo: 'bae' });
    const result = await this.stash.findById(value._id);
    expect(this.collection.findOne)
      .to.be.calledOnce;
    expect(result)
      .to.have.property('foo', 'bar');

  });

  it('should apply options', async function() {
    const value = { _id: ObjectID() };
    const changes = { $set: { foo: 'bar' } };
    const options = { upsert: true };

    redis.set.returns({ foo: 'bar' });
    const result = await this.stash.updateOne(value._id, changes, options);
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

    redis.getAsync.resolves(JSON.stringify({ foo: 'bar' }));
    const verify = await this.stash.findById(value._id);
    expect(this.collection.findOne)
      .to.have.callCount(0);
    expect(verify)
      .to.exist
      .to.have.property('foo', 'bar');

  });

});


describe('updateMany(3)', async function() {

  it('should update multiple entries', async function() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    const count = await this.stash.updateMany(query, changes);

    const verify = await this.stash.find(query);
    expect(verify)
      .to.have.length(count);

    verify.forEach(i => expect(i).to.have.property('foo', 'bar'));
  });

  it('should drop matched itmes from cache', async function() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    /* Execute update operation */
    await this.stash.updateMany(query, changes);

    /* Check if items are dropped; unmatched should remain cached */
    redis.getAsync.resolves(null);
    const actual1 = await this.stash.findById(this.data[0]._id);
    expect(actual1)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(1);

    const actual2 = await this.stash.findById(this.data[10]._id);
    expect(actual2)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(2);

    const actual3 = await this.stash.findById(this.data[19]._id);
    expect(actual3)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(3);

    const actual4 = await this.stash.findById(this.data[22]._id);
    expect(actual4)
      .not.to.have.property('foo');
    expect(this.collection.findOne)
      .to.have.callCount(4);

  });

  it('should take shortcut when nothing matches', async function() {
    const result = await this.stash.updateMany({ _id: 'foo' });
    expect(result)
      .to.equal(0);
    expect(this.collection.updateMany)
      .to.have.callCount(0);
  });

  it('should use safe version when in safe mode', async function() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };
    this.stash.safeMode = true;

    await this.stash.updateMany(query, changes);
    expect(this.stash.updateSafe)
      .to.be.calledOnce;
  });

  it('should throw when using upsert', async function() {
    const promise = this.stash.updateMany({ }, { }, { upsert: true });
    expect(promise)
      .to.be.rejectedWith('Upsert is only available with safe mode.');
  });

});


describe('updateSafe(3)', async function() {

  it('should update multiple entries', async function() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    const count = await this.stash.updateSafe(query, changes);

    const verify = await this.stash.find(query);
    expect(verify)
      .to.have.length(count);

    verify.forEach(i => expect(i).to.have.property('foo', 'bar'));
  });

  it('should drop all itmes from cache', async function() {
    const query = { index: { $lt: 20 } };
    const changes = { $set: { foo: 'bar' } };

    /* Execute update operation */
    await this.stash.updateSafe(query, changes);

    /* Check if items are dropped; unmatched should remain cached */
    redis.getAsync.resolves(null);
    const actual1 = await this.stash.findById(this.data[0]._id);
    expect(actual1)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(1);

    const actual2 = await this.stash.findById(this.data[10]._id);
    expect(actual2)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(2);


    const actual3 = await this.stash.findById(this.data[19]._id);
    expect(actual3)
      .to.have.property('foo', 'bar');
    expect(this.collection.findOne)
      .to.have.callCount(3);

    const actual4 = await this.stash.findById(this.data[22]._id);
    expect(actual4)
      .not.to.have.property('foo');
    expect(this.collection.findOne)
      .to.have.callCount(4);

  });

});
