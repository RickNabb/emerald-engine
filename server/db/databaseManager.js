/**
* databaseManager.js
* A file to serve as a master database manager for all transactions
* the app will require with any databases.
*/

module.exports = (fs) => {
  let mysql = require('./mysql-connect.js')

  function init() {
    mysql.connect('local-dev', () => {

    }) //TODO: Make this loaded from a config
  }
  return {
    "mysql": mysql,
    "init": init
  }
}
