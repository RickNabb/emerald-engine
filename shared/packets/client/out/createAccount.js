/**
* createACcount.js
* The account creation packet.
* This packet should be used to attempt to create a new user account.
*/

define(function (require) {

  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'createAccount'

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
