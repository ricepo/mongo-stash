/**
 * index.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */
const _            = require('lodash');
const Util         = require('util');
const EventEmitter = require('events').EventEmitter;

const Find         = require('./find');
const Cache        = require('./cache');
const Insert       = require('./insert');
const Update       = require('./update');
const Delete       = require('./delete');


/**
 * MongoStash class.
 */
/* eslint consistent-return: 0 */
function MongoStash(collection, options = 500) {

  if (!(this instanceof MongoStash)) {
    return new MongoStash(collection, options);
  }

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

  insertOne:  Insert.one,
  insertMany: Insert.many,

  findById:   Find.byId,
  findOne:    Find.one,
  find:       Find.list,

  updateOne:  Update.one,
  updateMany: Update.many,
  updateSafe: Update.safe,

  deleteOne:  Delete.one,
  deleteMany: Delete.many,
  deleteSafe: Delete.safe

});
