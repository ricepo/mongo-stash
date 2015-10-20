/**
 * test/fixtures.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const ObjectID = require('bson-objectid');


/*!
 * Generate data fixtures
 */
module.exports = [ ];

for (var i = 0; i < 100; i++) {
  module.exports.push({ _id: ObjectID(), index: i });
}
