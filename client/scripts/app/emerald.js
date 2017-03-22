/**
* app.js
* The main file for the client side of the application
*/

define(function (require) {
  let socket = require('../../socket.io/socket.io')()
  let packetManager = require('./packetManager').then(_packetManager =>
    // Create network threads and events here

    window.setInterval(() => {
      _packetManager.packets.out.ping.send(socket, new Date())
    }, 10000)
  )
  $(document).foundation()

  return {
    "socket": socket,
    "packetManager": packetManager
  }
})
