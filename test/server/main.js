/**
* main.js
* The main entry point to run the Emerald Engine test suite.
*/

/**
 * The file system module.
 */
let fs = require('fs')

/**
 * The promise node module.
 */
let promise = require('promise')

/**
 * The debug module.
 */
let debug = require(__dirname + '/../../server/utils/debug.js')

/**
 * The string function module.
 */
let stringFunctions = require(__dirname + '/../../server/utils/stringFunctions.js')

/**
 * The database module.
 */
let db = require(__dirname + '/../../server/db/databaseManager.js')(fs)

/**
 * The server's main engine.
 */
let engine = require(__dirname + '/../../server/engine.js')(null, debug, db, stringFunctions)

/**
 * Load in the JSON configuration.
 */
let config = require(__dirname + "/config.json")

/**
 * The authentication manager tests.
 */
let authManager = require(__dirname + "/auth/authManager.js")(db, engine, fs, promise)

/**
 * The data object manager.
 */
let dataObjectManager

/**
 * Run the test suite.
 */
async function run() {
  let test
  await db.init()
  dataObjectManager = await require(__dirname + '/../../server/dataObjects/dataObjectManager.js')(engine, db, fs, promise)
  engine.dataObjectManager = dataObjectManager
  for (test in config) {
    if (config[test] === 1) {
      if (test === "authManager") {
        authManager.run()
      }
    }
  }
}

run()
