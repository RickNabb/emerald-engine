/**
* packetManager.js
* A file to serve as a master manager for all packets
* the app will have to interact with.
*/

module.exports = (engine, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let packets = await require(__dirname + '/../shared/packets/server/in/connection.js')(engine, fs, promise)
    let socket

    engine.debug.log('Packet Manager started')
    resolve(
      {
        "packets": packets,
        "send": send,
        "setSocket": setSocket
      }
    )

    /**
     * Send a packet through the socket.
     * @param  {object} packet The packet module we want to use.
     * @param  {object} data   Any data the packet needs.
     */
    function send(packet, data) {
      console.log('emitting ' + packet.id + ': ' + data)
      packet.send(socket, data)
    }

    /**
     * Set the socket we want to use for outgoing packets.
     * @param  {object} _socket The socketIO instance to use.
     */
    function setSocket(_socket) {
      socket = _socket
    }
  })
}
