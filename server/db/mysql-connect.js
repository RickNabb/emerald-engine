/**
* mysql-connect.js
* (C) Yes And Games 2016
* Nick Rabb <nrabb@outlook.com>
* <yesandgames@gmail.com>
* A mySQL connection wrapper for the Yes And Games
* REST API.
*/

/*jslint node:true */
'use strict';

// VARIABLES
// ================================

let mysql = require('mysql');
let fs = require('fs');
let pool;

// FUNCTIONS
// ================================

/**
 * Create a pool to the MYSQL database.
 * @author Nick Rabb <nrabb@outlook.com>
 */
function connect(database) {
  return new Promise((resolve, reject) => {
    let i;
    fs.readFile(__dirname + '/../resources/data/db-info.json', 'utf8', (err, data) => {
        if (err) {
            reject(err)
        }
        let dataJSON = JSON.parse(data),
            mode = "";
        for (i = 0; i < dataJSON.length; i += 1) {
            if (dataJSON[i].id === database) {
                mode = dataJSON[i];
                break;
            }
        }
        pool = mysql.createPool({
            host: mode.host,
            user: mode.user,
            password: mode.password,
            database: mode.databaseName
        });
        if (pool) {
          console.log("Connection to MySQL " + mode.id + " : " + mode.databaseName + " set up");
        }
        // Run any further server initialization code
        resolve();
    });
  })
}

/**
 * Send a query to the MYSQL pool.
 * @author Nick Rabb <nrabb@outlook.com>
 * @param {string} queryString - The query to send to the MYSQL pool.
 * @param {array} params - Parameters to send into a potentially parameterized query string.
 * @param {function} callback - Code to run when the request is complete
 */
function query(queryString, params, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            callback(err, 'Error connecting to the database');
        } else {
            conn.query(queryString, params, (err, results) => {
                // Debugging
                // console.log("Query results: " + JSON.stringify(results));
                // console.log("Query: " + queryString);
                if (callback) {
                  callback(err, results)
                } else {
                  res.json(results)
                }
                conn.release();
            });
        }
    });
}

/**
 * Return a Promise that will send a query to the MySQL Pool.
 * @author Nick Rabb <nrabb@outlook.com>
 * @param {string} queryString - The query to send to the MYSQL pool.
 * @param {array} params - Parameters to send into a potentially parameterized query string.
 */
function queryPromise(queryString, params) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
        if (err) {
            reject('Error connecting to the database: ' + err)
        } else {
            conn.query(queryString, params, (err, results) => {
                // Debugging
                // console.log("Query results: " + JSON.stringify(results));
                // console.log("Query: " + queryString);

                conn.release()
                if (err) reject(err)
                resolve(results)
            })
        }
    });
  })
}

/**
 * Close the MYSQL connection
 * @author Nick Rabb <nrabb@outlook.com>
 */
function closeConnection() {
    // Make sure the connection isn't null
    if (pool === null) {
        return null;
    }

    pool.end();
}

// EXPORTS
// ================================

exports.connect = connect;
exports.query = query;
exports.queryPromise = queryPromise;
exports.closeConnection = closeConnection;
exports.pool = pool;
