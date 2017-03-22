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
      let packets = {"in": [], "out": []}, packet, index
      $.get('/api/packets/client',
        function (data) {
          for (index in data.in) {
            packet = data.in[index]
            console.log(packet)
            require(['../../api/packets/client/in/' + packet], (packetMod) => {
              packets.in[packet] = (packetMod)
            })
          }
          for (index in data.out) {
            packet = data.out[index]
            console.log(packet)
            require(['../../api/packets/client/out/' + packet], (packetMod) => {
              packets.out[packet] = (packetMod)
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
      "packets": packets,
      // "send": send
    })
  })
})
