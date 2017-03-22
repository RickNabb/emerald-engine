/**
* ping.js
* The ping packet.
* This packet should be used to determine if a client is still connected
* to the server.
*/

/**
 * handlePacket - Handle the ping packet on the server side.
 *
 * @param  {object} socket Our connection to the SocketIO module.
 */
function handlePacket (data) {
  console.log(data['datetime'] + ': Ping from client')
}

exports.handlePacket = handlePacket
