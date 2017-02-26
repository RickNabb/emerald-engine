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
function connect(database, callback) {
    let i;
    fs.readFile('./server/resources/data/db-info.json', 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
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
          console.log("Connection to MySQL " + mode.id + " : " + mode.databaseName + " established");
        }
        // Run any further server initialization code
        callback();
    });
}

/**
 * Send a query to the MYSQL pool.
 * @author Nick Rabb <nrabb@outlook.com>
 * @param {string} queryString - The query to send to the MYSQL pool.
 * @param {array} params - Parameters to send into a potentially parameterized query string.
 * @param {function} callback - Code to run when the request is complete
 * @param {object} res - The results to set when the function completes.
 */
function query(queryString, params, callback, res) {
    pool.getConnection((err, conn) => {
        if (err) {
            res.status(400);
            res.send('Error connecting to the database: ' + err);
        } else {
            conn.query(queryString, params, (err, results) => {
                // Debugging
                // console.log("Query results: " + JSON.stringify(results));
                // console.log("Query: " + queryString);
                if (err !== null) {
                    console.log("Error: " + err);
                }
                if (!err) {
                    if (callback === null) {
                        res.json(results);
                    } else {
                        res = results;
                        callback(res);
                    }
                }
                conn.release();
            });
        }
    });
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
exports.closeConnection = closeConnection;
exports.pool = pool;
