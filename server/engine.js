/**
* engine.js
* All of the state and constant variables we want to share
* across the whole platform.
*/

let io, debug, ROOT_DIR

/**
 * Engine - Construct the server engine
 *
 * @param  {object} io    The SocketIO module
 * @param  {object} debug The debug module
 */
module.exports = (_io, _debug) => {
  return {
    "io": _io,
    "debug": _debug,
    "ROOT_DIR": __dirname
  }
}
module.exports.io = io
module.exports.debug = debug
module.exports.ROOT_DIR = ROOT_DIR
