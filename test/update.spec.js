/**
 * test/update.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const _            = require('lodash');
const Sinon        = require('sinon');
const expect       = require('chai').expect;
const ObjectID     = require('bson-objectid');
const Bluebird     = require('bluebird');

const MongoStash   = require('../lib/index.js');


/*!
 * Setup testing infrastructure
 */
beforeEach(function() {
  this.collection = {
    findOneAndUpdate: Sinon.spy(function(query, changes) {
      return Bluebird.resolve(
        { value: _.assign({ }, query, changes) }
      );
    }),
    updateMany: Sinon.spy(function() {
      return Bluebird.resolve();
    })
  };
  this.stash = new MongoStash(this.collection);
  this.id = new ObjectID();
});


/*!
 * Test cases start
 */
describe('updateOne(2)', function() {

  it('should update single entry by ID', function() {
    const promise = this.stash.updateOne(this.id, { foo: 'bar' }, null);

    return promise.then(result => {
      expect(result).to.deep.equal({ _id: this.id, foo: 'bar' });
      expect(this.stash.cache.has(this.id.toString())).to.be.true;

      expect(this.collection.findOneAndUpdate).to.be.calledOnce;
      const args = this.collection.findOneAndUpdate.firstCall.args;
      expect(args).to.be.an('array').and.to.have.length(3);
      expect(args[0]).to.deep.equal({ _id: this.id });
      expect(args[1]).to.deep.equal({ foo: 'bar' });
      expect(args[2]).to.deep.equal({ returnOriginal: false });
    });
  });

});
