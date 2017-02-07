/**
* packetManager.js
* A file to serve as a master manager for all packets
* the app will have to interact with.
*/

module.exports = (engine, fs) => {
  return new Promise(async (resolve, reject) => {
    await require('../shared/packets/connection.js')(engine, fs)
      .then(packets => resolve(
        {
          "engine": engine,
          "packets": packets
        }
      ))
  })
}
