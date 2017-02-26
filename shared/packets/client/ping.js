/**
* ping.js
* The ping packet.
* This packet should be used to determine if a client is still connected
* to the server.
*/

define(function (require) {

  function send(socket, dateTime) {
    console.log('Pinging server...')
    socket.emit('ping', {
      "datetime": dateTime
    })
  }

  return {
    "send": send
  }
})
