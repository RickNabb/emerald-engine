/**
* ping.js
* The ping packet.
* This packet should be used to determine if a client is still connected
* to the server.
*/

define(function (require) {

  function send(socket, dateTime) {
    console.log('Pinging server...')
    try {
      socket.emit('clientPing', {"datetime": dateTime})
    } catch (err) {
      console.log('Error: ' + err)
    }
  }

  return {
    "send": send
  }
})
