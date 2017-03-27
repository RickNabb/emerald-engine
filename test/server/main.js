/**
* main.js
* The main entry point to run the Emerald Engine test suite.
*/

/**
 * The file system module.
 */
let fs = require('fs')

/**
 * The database module.
 */
let db = require(__dirname + '/../server/db/databaseManager.js')(fs)

/**
 * Load in the JSON configuration.
 */
let config = require(__dirname + "/config.json")

/**
 * The authentication manager tests.
 */
let authManager = require(__dirname + "/auth/authManager.js")(db)

/**
 * Run the test suite.
 */
function run() {
  let test
  db.init();
  for (test in config) {
    if (config[test] === 1) {
      if (test === "authManager") {
        authManager.run()
      }
    }
  }
}
