
module.exports = (engine) => {

  const id = 'loginResponse'

  function send(socket, data) {
    try {
      socket.emit(id, data)
    } catch (err) {
      engine.debug.error(err)
    }
  }

  return {
    "send": send,
    "id": id
  }
}
