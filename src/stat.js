/**
 * stats.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 *
 * @desc    Wrapper around functions to collect their execution stats.
 */


function stat(fn, name) {
  return async function(...args) {


    /**
     * Take a high-resolution snapshot of the start time
     */
    const start = process.hrtime();


    /**
     * Execute the function
     */
    const result = await fn.call(this, ...args);


    /**
     * Compute the execution time
     */
    const delta = process.hrtime(start);
    const nanosec = delta[0] * 1e9 + delta[1];
    const ms = nanosec / 1e6;

    this.stats.point(ms, name);


    /**
     * Return the original result
     */
    return result;
  };
}
module.exports = stat;
