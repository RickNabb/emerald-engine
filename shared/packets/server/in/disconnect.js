/**
* disconnect.js
* The disconnect packet incoming from the client..
*/

module.exports = (engine) => {
  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'disconnect'

  function handlePacket (socket) {
    console.log('A user disconnected')
  }

  return {
    "handlePacket": handlePacket,
    "id": id
  }
}
