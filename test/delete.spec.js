/**
 * test/delete.spec.js
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
  this.collection.deleteOne = Sinon.spy(this.collection.deleteOne);
  this.collection.deleteMany = Sinon.spy(this.collection.deleteMany);

  this.stash = new MongoStash(this.collection);
  this.stash.deleteSafe = Sinon.spy(this.stash.deleteSafe);
});


/*!
 * Test cases start
 */
describe('deleteOne(1)', async function() {

  it('should delete a single entry by ID', async function() {
    const value = this.data[54];

    const result = await this.stash.deleteOne(value._id);
    expect(result)
      .to.be.true;
    expect(this.collection.deleteOne)
      .to.be.calledOnce;
    const args = this.collection.deleteOne.firstCall.args;
    expect(args)
      .to.have.length(1);
    expect(args[0])
      .to.deep.equal({ _id: value._id });
  });

  it('should drop the deleted entry from cache', async function() {
    const value = this.data[54];

    /* Cache the value */
    await this.stash.findById(value._id);
    expect(this.stash.cache.has(value._id.toString()))
      .to.be.true;

    /* Delete the value */
    const result = await this.stash.deleteOne(value._id);
    expect(result)
      .to.be.true;
    expect(this.stash.cache.has(value._id.toString()))
      .to.be.false;
  });

});

describe('deleteMany(1)', async function() {

  it('should delete matching entries', async function() {
    const query = { index: { $lt: 20 } };

    const count = await this.stash.deleteMany(query);
    expect(count).to.equal(20);

    const confirm = await this.stash.find(query);
    expect(confirm)
      .to.have.length(0);
  });

  it('should drop matched itmes from cache', async function() {
    const query = { index: { $lt: 20 } };

    /* Make stash cache some IDs */
    await this.stash.findById(this.data[0]._id);
    await this.stash.findById(this.data[10]._id);
    await this.stash.findById(this.data[19]._id);
    await this.stash.findById(this.data[22]._id);

    /* Execute update operation */
    await this.stash.deleteMany(query);

    /* Check if items are dropped; unmatched should remain cached */
    const actual1 = await this.stash.findById(this.data[0]._id);
    expect(actual1)
      .not.to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(5);

    const actual2 = await this.stash.findById(this.data[10]._id);
    expect(actual2)
      .not.to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(6);

    const actual3 = await this.stash.findById(this.data[19]._id);
    expect(actual3)
      .not.to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(7);

    const actual4 = await this.stash.findById(this.data[22]._id);
    expect(actual4)
      .to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(7);

  });

  it('should take shortcut when nothing matches', async function() {
    const result = await this.stash.deleteMany({ _id: 'foo' });
    expect(result)
      .to.equal(0);
    expect(this.collection.deleteMany)
      .to.have.callCount(0);
  });

  it('should use safe version when in safe mode', async function() {
    const query = { index: { $lt: 20 } };
    this.stash.safeMode = true;

    await this.stash.deleteMany(query);
    expect(this.stash.deleteSafe)
      .to.be.calledOnce;
  });

});

describe('deleteSafe(1)', async function() {

  it('should delete matching entries', async function() {
    const query = { index: { $lt: 20 } };

    const count = await this.stash.deleteSafe(query);
    expect(count).to.equal(20);

    const confirm = await this.stash.find(query);
    expect(confirm)
      .to.have.length(0);
  });

  it('should drop all itmes from cache', async function() {
    const query = { index: { $lt: 20 } };

    /* Make stash cache some IDs */
    await this.stash.findById(this.data[0]._id);
    await this.stash.findById(this.data[10]._id);
    await this.stash.findById(this.data[19]._id);
    await this.stash.findById(this.data[22]._id);

    /* Execute update operation */
    await this.stash.deleteSafe(query);

    /* Check if items are dropped; unmatched should remain cached */
    const actual1 = await this.stash.findById(this.data[0]._id);
    expect(actual1)
      .not.to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(5);

    const actual2 = await this.stash.findById(this.data[10]._id);
    expect(actual2)
      .not.to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(6);

    const actual3 = await this.stash.findById(this.data[19]._id);
    expect(actual3)
      .not.to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(7);

    const actual4 = await this.stash.findById(this.data[22]._id);
    expect(actual4)
      .to.exist;
    expect(this.collection.findOne)
      .to.have.callCount(8);

  });

});
