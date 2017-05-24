/**
* login.js
* The login packet.
* This packet should be used to attempt to authenticate the user into
* the application.
*/

define(function (require) {

  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'login'

  /**
   * Send the login packet to the server.
   * @param  {object} socket The SocketIO socket.
   * @param  {object} data   Object of form { username, password }
   */
  function send(socket, data) {
    try {
      socket.emit(id, data)
    } catch (err) {
      console.log('Error: ' + err)
    }
  }

  return {
    "send": send,
    "id": id
  }
})
