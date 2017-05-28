/**
* databaseManager.js
* A file to serve as a master database manager for all transactions
* the app will require with any databases.
*/

module.exports = (fs) => {
  let mysql = require('./mysql-connect.js')(fs)

  function init() {
    return new Promise(async (resolve, reject) => {
      // TODO : I feel like this is super hacky and should just happen
      // naturally... Look into this.
      mysql.dbName = await mysql.connect('local-dev')
      //TODO: Make this loaded from a config
      resolve()
    })
  }

  return {
    "mysql": mysql,
    "init": init
  }
}
