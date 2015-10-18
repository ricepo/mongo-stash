/**
 * test/index.spec.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const Chai         = require('chai');
Chai.use(require('sinon-chai'));
Chai.use(require('chai-as-promised'));

const Sinon        = require('sinon');
const expect       = Chai.expect;

const MongoStash   = require('../lib/index.js');
