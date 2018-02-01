/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');
const Util         = require('util');
const Stats        = require('rolling-stats');
const EventEmitter = require('events').EventEmitter;

const Stat         = require('./stat');
const Cache        = require('./cache');
const Find         = require('./query/find');
const Insert       = require('./query/insert');
const Update       = require('./query/update');
const Delete       = require('./query/delete');


/**
 * MongoStash class.
 */
/* eslint consistent-return: 0 */
function MongoStash(collection, options = 500) {

  if (!(this instanceof MongoStash)) {
    return new MongoStash(collection, options);
  }

  this.stats = Stats.NamedStats(1111, 1000);
  this.cache = Cache(this, options);
  this.collection = collection;

  this.defaults = Object.create(null);
  this.projection = Object.create(null);

  this.safeMode = false;
}
module.exports = MongoStash;


/*!
 * Let stash emit events
 */
Util.inherits(MongoStash, EventEmitter);


/*!
 * Attach all member functions.
 */
_.assign(MongoStash.prototype, {

  insertOne:  Stat(Insert.one, 'insertOne'),
  insertMany: Stat(Insert.many, 'insertMany'),

  findById:   Stat(Find.byId, 'findById'),
  findOne:    Stat(Find.one, 'findOne'),
  find:       Stat(Find.list, 'find'),

  updateOne:  Stat(Update.one, 'updateOne'),
  updateMany: Stat(Update.many, 'updateMany'),
  updateSafe: Stat(Update.safe, 'updateSafe'),

  deleteOne:  Stat(Delete.one, 'deleteOne'),
  deleteMany: Stat(Delete.many, 'deleteMany'),
  deleteSafe: Stat(Delete.safe, 'deleteSafe')

});
