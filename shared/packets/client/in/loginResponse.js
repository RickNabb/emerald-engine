/**
* loginResponse.js
* The incoming client login response packet.
* This packet should handle the receipt of the server's login response
* object.
*/
define(function (require) {

  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'loginResponse'

  /**
   * A function to run when we receive data.
   */
  let responseHandler

  /**
   * Handle the login response from the server.
   * @param  {object} socket Our connection to the SocketIO module.
   */
  function handlePacket (data) {
    responseHandler(data)
  }

  /**
   * Set the repsonse handler to invoke after receiving data.
   * @param  {function} _responeHandler A handler to run with our
   * receieved data.
   */
  function setResponseHandler(_responeHandler) {
    responseHandler = _responeHandler
  }

  return {
    "handlePacket": handlePacket,
    "setResponseHandler": setResponseHandler,
    "id": id
  }
})
