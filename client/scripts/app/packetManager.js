/**
* packetManager.js
* The packet manager for the client side of the application
*/
define(function (require) {

  /**
   * init - Initialize the packet manager.
   */
  function init() {
    return new Promise((resolve, reject) => {
      let packets = {"in": {}, "out": {}}, packet, index
      $.get('/packetManifest',
        function (data) {
          for (index in data.client.in) {
            packet = data.client.in[index]
            require(['../../packets/in/' + packet], (packetMod) => {
              packets.in[packet] = (packetMod)
            })
          }
          for (index in data.client.out) {
            packet = data.client.out[index]
            require(['../../packets/out/' + packet], (packetMod) => {
              packets.out[packet] = packetMod
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
  // function send(packet, data) {
  //   packet.send(socket, data)
  // }

  return new Promise(async (resolve, reject) => {
    let packets = await init()
    resolve({
      "packets": packets
    })
  })
})
