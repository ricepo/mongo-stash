/**
 * test/index.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Chai         = require('chai');
Chai.use(require('sinon-chai'));
Chai.use(require('chai-as-promised'));

/*!
 * Import stuff for testing
 */
const MongoDB      = require('mongodb');
const LruCache     = require('lru-cache');
const expect       = Chai.expect;

const MongoStash   = require('../lib/index.js');


/*!
 * Setup and teardown the native DB connection
 */
before(function(done) {
  this.dburl  = `mongodb://localhost:27017/mongo-stash`;
  MongoDB.connect(this.dburl, (err, db) => {
    this.db = db;
    done(err);
  });
});

after(function(done) {
  this.db.close(true, done);
});


/*!
 * Test cases start here
 */
describe('constructor(2)', function() {

  function isMongoStash(obj, collection) {
    expect(obj).to.be.an.instanceOf(MongoStash);
    expect(obj.cache).to.be.an.instanceOf(LruCache);
    expect(obj.collection).to.equal(collection);
    expect(obj.defaults).to.be.an('object');
    expect(obj.projection).to.be.an('object');
  }

  it('should create a MongoStash instance', function() {
    const collection = { };

    const actual = new MongoStash(collection);

    isMongoStash(actual, collection);
    expect(actual.cache._max).to.equal(500);
  });

  it('should pass on optional parameters', function() {
    const collection = { };

    const actual = new MongoStash(collection, 1234);

    isMongoStash(actual, collection);
    expect(actual.cache).to.have.property('_max', 1234);
  });

  it('should allow direct call', function() {
    const collection = { };
    const actual = MongoStash(collection, 321);

    isMongoStash(actual, collection);
    expect(actual.cache).to.have.property('_max', 321);
  });

});

describe('cache(1)', function() {
  require('./cache.spec.js');
});

describe('find', function() {
  require('./find.spec.js');
});

describe('insert', function() {
  require('./insert.spec.js');
});
