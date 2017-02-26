/**
* app.js
* The main file for the client side of the application
*/

define(function (require) {
  let socket = require('../../socket.io/socket.io')()
  socket.emit('ping')
  let packetManager = require('./packetManager').then(_packetManager =>
    // Create network threads and events here

    window.setInterval(() => {
      _packetManager.packets.ping.send(socket, new Date())
    }, 5000)
  )
})
