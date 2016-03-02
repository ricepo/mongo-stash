/**
 * test/objectid.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const ObjectID     = require('bson-objectid');
const objectid     = dofile('objectid');


it('should directly return ObjectID instance', async function() {
  const expected = new ObjectID();
  const actual   = objectid(expected);

  expect(actual)
    .to.be.an.instanceOf(ObjectID)
    .to.equal(expected);
});

it('should recognize ObjectID strings', async function() {
  const expected = new ObjectID().toString();
  const actual   = objectid(expected);

  expect(actual)
    .to.be.an.instanceOf(ObjectID);
  expect(actual.toString())
    .to.equal(expected);
});

it('should directly return other string values', async function() {
  const expected = 'foobar123';
  const actual   = objectid(expected);

  expect(actual)
    .to.be.a('string')
    .to.equal(expected);
});
