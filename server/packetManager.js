/**
* packetManager.js
* A file to serve as a master manager for all packets
* the app will have to interact with.
*/

module.exports = (engine, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let packets = await require(__dirname + '/../shared/packets/server/in/connection.js')(engine, fs, promise)
    engine.debug.log('Packet Manager started')

    function send(packet, data) {

    }

    resolve(
      {
        "packets": packets
      }
    )
  })
}
