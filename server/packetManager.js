/**
* packetManager.js
* A file to serve as a master manager for all packets
* the app will have to interact with.
*/

module.exports = (engine, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let packets = await require('../shared/packets/server/connection.js')(engine, fs, promise)
    resolve(
        {
          "engine": engine,
          "packets": packets
        })
  })
}
