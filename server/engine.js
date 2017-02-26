/**
* engine.js
* All of the state and constant variables we want to share
* across the whole platform.
*/

/**
 * Engine - Construct the server engine
 *
 * @param  {object} io    The SocketIO module
 * @param  {object} debug The debug module
 * @param  {object} db    The database manager
 */
module.exports = (_io, _debug, _db) => {
  return {
    "io": _io,
    "debug": _debug,
    "db": _db,
    "ROOT_DIR": __dirname
  }
}
