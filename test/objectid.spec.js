/**
 * test/objectid.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const expect       = require('chai').expect;
const ObjectID     = require('bson-objectid');

const objectid     = require('../lib/objectid');


it('should directly return ObjectID instance', function() {
  const expected = new ObjectID();
  const actual   = objectid(expected);

  expect(actual)
    .to.be.an.instanceOf(ObjectID)
    .to.equal(expected);
});

it('should recognize ObjectID strings', function() {
  const expected = new ObjectID().toString();
  const actual   = objectid(expected);

  expect(actual)
    .to.be.an.instanceOf(ObjectID);
  expect(actual.toString())
    .to.equal(expected);
});

it('should directly return other string values', function() {
  const expected = 'foobar123';
  const actual   = objectid(expected);

  expect(actual)
    .to.be.a('string')
    .to.equal(expected);
});
