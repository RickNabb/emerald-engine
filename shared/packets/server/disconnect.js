/**
* disconnect.js
* The disconnect packet incoming from the client..
*/


function handlePacket (socket) {
  console.log('A user disconnected')
}

try {
  exports.handlePacket = handlePacket
} catch (e) {
  if (e.name == "ReferenceError") {
    // Do nothing - this is here to save the client require
  }
}
