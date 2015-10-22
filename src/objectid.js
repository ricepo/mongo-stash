/**
 * objectid.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

import ObjectID    from 'bson-objectid';


/**
 * Determines whether a string represents a BSON ObjectID or just a string ID.
 * Returns the normalized version.
 */
export default function objectid(str) {

  /* If this is a valid ObjectID, return it directly */
  if (ObjectID.isValid(str)) { return ObjectID(str); }

  /* Otherwise, this is a string ID */
  return str;

}
