/**
 * test/index.spec.js
 *
 * @author  Denis Luchkin-Zhou <wyvernzora@gmail.com>
 * @license MIT
 */

const Chai         = require('chai');
Chai.use(require('sinon-chai'));
Chai.use(require('chai-properties'));
Chai.use(require('chai-as-promised'));

const Path         = require('path');
const Root         = require('app-root-path');
Root.setPath(Path.resolve(__dirname, '../src'));

const ShortID      = require('shortid');
const MongoDB      = require('mongodb');
const fixtures     = require('./fixtures');
const LruCache     = require('lru-cache');


/*!
 * Setup global stuff here.
 */
global.dofile      = Root.require;
global.expect      = Chai.expect;
global.Sinon       = require('sinon');


const MongoStash   = dofile('index');

/*!
 * Setup and teardown the native DB connection
 */
before(async function(done) {
  this.dburl  = `mongodb://localhost:27017/mongo-stash`;
  MongoDB.connect(this.dburl, (err, db) => {
    this.db = db;
    done(err);
  });
});
after(async function(done) {
  this.db.close(true, done);
});
beforeEach(async function() {
  this._name = ShortID.generate();
  this.data = fixtures;
  this.collection = this.db.collection(this._name);
  return this.collection.insertMany(fixtures);
});
afterEach(async function() {
  this.collection.drop();
});


/*!
 * Start tests.
 */
describe('constructor(2)', () => {

  async function isMongoStash(obj, collection) {
    expect(obj).to.be.an.instanceOf(MongoStash);
    expect(obj.cache).to.be.an.instanceOf(LruCache);
    expect(obj.collection).to.equal(collection);
    expect(obj.defaults).to.be.an('object');
    expect(obj.projection).to.be.an('object');
  }

  it('should create a MongoStash instance', async function() {
    const actual = new MongoStash(this.collection);

    isMongoStash(actual, this.collection);
  });

  it('should pass on optional parameters', async function() {
    const actual = new MongoStash(this.collection, 1234);

    isMongoStash(actual, this.collection);
  });

  it('should allow direct call', async function() {
    const actual = MongoStash(this.collection, 321);

    isMongoStash(actual, this.collection);
  });

});

describe('objectid(1)', () => {
  require('./objectid.spec.js');
});

describe('cache(1)', () => {
  require('./cache.spec.js');
});

describe('find', () => {
  require('./find.spec.js');
});

describe('insert', () => {
  require('./insert.spec.js');
});

describe('update', () => {
  require('./update.spec.js');
});

describe('delete', () => {
  require('./delete.spec.js');
});
