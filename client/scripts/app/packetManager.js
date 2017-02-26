/**
* packetManager.js
* The packet manager for the client side of the application
*/
define(function (require) {

  /**
   * init - Initialize the packet manager.
   */
  function init() {
    return new Promise(async (resolve, reject) => {
      let packets = {}, packet
      $.get('/api/packets/client',
        function (data) {
          let packets = {}
          for (index in data) {
            packet = data[index]
            require(['../../api/packets/client/' + packet], (packetMod) => {
              packets[packet] = (packetMod)
            })
          }
          resolve(packets)
        })
    })
  }

  /**
   * send - Send a packet to the server.
   *
   * @param  {string} packet The packet name.
   * @param  {object} data   JSON data to send.
   */
  function send(packet, data) {
    packet.send(socket, data)
  }

  return new Promise(async (resolve, reject) => {
    let packets = await init()
    resolve({
      "packets": packets,
      "send": send
    })
  })
})
