/**
* dataObjectManager.js
* A file to serve as a master manager for all data objects
* the app will need.
*/

module.exports = (engine, db, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let dataObjects
    let asyncTasks = []
    let readdirAsync = promise.denodeify(fs.readdir)
    let readfileAsync = promise.denodeify(fs.readFile)
    let dataTypes = {
      "int(11)": "int",
      "varchar(255)": "string",
      "tinyint(1)": "boolean"
    }

    dataObjects = await collectDataObjects()
    asyncTasks.push(updateDatabase())
    asyncTasks.push(writeDataObjectModules())
    await Promise.all(asyncTasks)
      .catch(err => engine.debug.error(err))
    engine.debug.log('Data Object Manager started')
    resolve({
     "dataObjects": dataObjects
    })

    /**
     * collectDataObjects - Read all of the files in the data objects directory
     * into a collection that we can use to use those objects in the engine.
     *
     * @return {object} A collection of all the data objects keyed by name.
     */
    async function collectDataObjects() {
      return new Promise(async (resolve, reject) => {
        let index, filePromises = [], parsePromises = [], dataObjects = {}
        let filePath = __dirname + "/../resources/data/dataObjects"
        let files = await readdirAsync(filePath)
        for (index in files) {
          filePromises.push(readfileAsync(filePath + '/' + files[index]))
        }
        let readFiles = await Promise.all(filePromises)
        for (index in readFiles) {
          dataObjects[files[index].replace('.js', '')] = JSON.parse(readFiles[index].toString('utf8'))
        }
        resolve(dataObjects)
      })
    }

    /**
     * updateDatabase - Update the database by scanning the data objects
     * directory and creating tables, if they don't already exist, for the
     * data objects & their specified attributes
     * TODO : Clean this up!
     */
    function updateDatabase() {
      return new Promise(async (resolve, reject) => {
        let primary = -1
        let dbQueries = [], results = []
        let dataObject, query, dataObjectAttrs, dataObjectAttr,
          dataObjectAttrProps, i, columnResults, dataObjectAttrNames
        for (dataObject in dataObjects) {
          dataObjectAttrs = cloneJSON(dataObjects[dataObject])
          query = "SHOW columns FROM " + dataObject + ";"
          columnResults = await db.mysql.queryPromise(query, [])
            .catch(err => reject(err))
          dataObjectAttrNames = Object.keys(dataObjectAttrs)
          if (columnResults.length === dataObjectAttrNames.length) {
            for (i = 0; i < columnResults.length; i++) {
              if (columnResults[i].Field !== dataObjectAttrNames[i] && dataObjectAttrs[dataObjectAttrNames[i]].includes(dataTypes[columnResults[i].Type])) {
                query = "ALTER TABLE `" + dataObject + "` CHANGE COLUMN `" + columnResults[i].Field + "` `" + dataObjectAttrNames[i] + "` " + columnResults[i].Type + ";"
                dbQueries.push(db.mysql.queryPromise(query, []))
              }
              if (columnResults[i].Field === dataObjectAttrNames[i] && !dataObjectAttrs[dataObjectAttrNames[i]].includes(dataTypes[columnResults[i].Type])) {
                query = "ALTER TABLE `" + dataObject + "` CHANGE COLUMN `" + dataObjectAttrNames[i] + "` `" + dataObjectAttrNames[i] + "` "
                dataObjectAttrProps = dataObjectAttrs[dataObjectAttrNames[i]]
                if (dataObjectAttrProps.includes('int'))
                  query += 'int(11) '
                else if (dataObjectAttrProps.includes('string'))
                  query += 'varchar(255) COLLATE utf32_unicode_ci '
                else if (dataObjectAttrProps.includes('boolean'))
                  query += 'tinyint(1) '
                dbQueries.push(db.mysql.queryPromise(query, []))
              }
              if (columnResults[i].Default !== 'null') {
                query = "ALTER TABLE `" + dataObject + "` CHANGE COLUMN `" + columnResults[i].Field + "` `" + columnResults[i].Field + "` " + columnResults[i].Type + " NOT NULL;"
                dbQueries.push(db.mysql.queryPromise(query, []))
              }
            }
          } else if (columnResults.length !== dataObjectAttrNames.length) {
            engine.debug.log("The data object '" + dataObject + "' and its corresponding mySQL table are unequal, and too disparate to automatically change. Please change one or the other.")
          } else if (columnResults === undefined) {
            query = "CREATE TABLE IF NOT EXISTS `" + dataObject + '` ('
            for (dataObjectAttr in dataObjectAttrs) {
              query += '`' + dataObjectAttr + '` '
              dataObjectAttrProps = dataObjectAttrs[dataObjectAttr]
              if (dataObjectAttrProps.includes('int'))
                query += 'int(11) '
              else if (dataObjectAttrProps.includes('string'))
                query += 'varchar(255) COLLATE utf32_unicode_ci '
              else if (dataObjectAttrProps.includes('boolean'))
                query += 'tinyint(1) '
              query += 'NOT NULL'
              if (dataObjectAttrProps.includes('primary')) {
                query += ' AUTO_INCREMENT'
                primary = dataObjectAttr
              }
              query += ','
            }
            if (primary !== -1)
              query += 'PRIMARY KEY (`' + primary + '`)'
            query += ') ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;'
            dbQueries.push(db.mysql.queryPromise(query, []))
          }
        }
        Promise.all(dbQueries)
          .catch(error => reject(error))
        resolve()
      })
    }

    function cloneJSON(obj) {
      let newObj = Object.keys(obj).reduce(function(previous, current) {
        previous[current] = obj[current]
        return previous
      }, {})
      return newObj
    }

    /**
     * Write data object module files, containing CRUD operations on the
     * object, that we can use inside the app
     */
    function writeDataObjectModules() {
      return new Promise((resolve, reject) => {
        let fileWrites = [], results = []
        let dataObject, fileContents, fileAppend, dataObjectAttrs, dataObjectAttr, dataObjectAttrProps, dataObjectAttrStr, capitalDataObject
        let writeFilePromise = promise.denodeify(fs.writeFile)
        for (dataObject in dataObjects) {
          dataObjectAttrs = cloneJSON(dataObjects[dataObject])
          capitalDataObject = engine.stringFunctions.capitalizeFirstLetter(dataObject)
          // Remove the id attribute from the DO attributes
          // because we don't want to insert IDs, etc.
          if (dataObjectAttrs.id) {
            delete dataObjectAttrs['id']
          }
          // File header
          fileContents =
            "/**\n" +
            "* " + dataObject + ".js\n" +
            "* The auto-generated data manipulator module for the \n" +
            "* " + dataObject + " data object.\n" +
            "*/\n" +
            "module.exports = (db) => {\n" +
            "\tfunction create" + capitalDataObject + "("
          // Create function
          fileAppend = ""
          for (dataObjectAttr in dataObjectAttrs) {
            fileAppend += dataObjectAttr + ","
          }
          dataObjectAttrStr = fileAppend.substring(0, fileAppend.length - 1)
          fileContents += dataObjectAttrStr + ",callback) {\n" +
            "\t\tdb.query('INSERT INTO `" + dataObject + "` (" + dataObjectAttrStr + ") VALUES ("
          fileAppend = ""
          for (dataObjectAttr in dataObjectAttrs) {
            fileAppend += "?,"
          }
          fileAppend = fileAppend.substring(0, fileAppend.length - 1)
          fileContents += fileAppend + ")',\n" +
            "\t\t\t[" + dataObjectAttrStr + "],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Update function
          fileContents += "\tfunction update" + capitalDataObject + "(id," + dataObjectAttrStr + ",callback) {\n" +
            "\t\tdb.query('UPDATE `" + dataObject + "` SET "
          fileAppend = ""
          for (dataObjectAttr in dataObjectAttrs) {
            fileAppend += "`" + dataObjectAttr + "`=?,"
          }
          fileAppend = fileAppend.substring(0, fileAppend.length - 1)
          fileContents += fileAppend + " WHERE `id`=?)',\n" +
            "\t\t\t[" + dataObjectAttrStr + ",id],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Remove function
          fileContents += "\tfunction remove" + capitalDataObject + "(id,callback) {\n" +
            "\t\tdb.query('DELETE FROM `" + dataObject + "` WHERE `id`=?)',\n" +
            "\t\t\t[id],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Get singular function
          fileContents += "\tfunction get" + capitalDataObject + "(id,callback) {\n" +
            "\t\tdb.query('SELECT * FROM `" + dataObject + "` WHERE `id`=?)',\n" +
            "\t\t\t[id],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Get all function
          fileContents += "\tfunction get" + capitalDataObject + "s(id,callback) {\n" +
            "\t\tdb.query('SELECT * FROM `" + dataObject + "` )',\n" +
            "\t\t\t[],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n" +
            "\treturn {\n" +
            "\t\t\"create" + capitalDataObject + "\": create" + capitalDataObject + ",\n" +
            "\t\t\"update" + capitalDataObject + "\": update" + capitalDataObject + ",\n" +
            "\t\t\"remove" + capitalDataObject + "\": remove" + capitalDataObject + ",\n" +
            "\t\t\"get" + capitalDataObject + "\": get" + capitalDataObject + ",\n" +
            "\t\t\"get" + capitalDataObject + "s\": get" + capitalDataObject + "s\n\t}\n"
          fileContents += "}"
          fileWrites.push(writeFilePromise(__dirname + '/' + dataObject + '.js', fileContents))
        }
        Promise.all(fileWrites)
          .catch(error => engine.debug.error(error))
        resolve()
      })
    }
  })
}
