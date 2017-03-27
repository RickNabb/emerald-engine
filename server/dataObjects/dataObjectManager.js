/**
* dataObjectManager.js
* A file to serve as a master manager for all data objects
* the app will need.
*/

module.exports = (engine, db, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let dataObjects
    let readdirAsync = promise.denodeify(fs.readdir)
    let readfileAsync = promise.denodeify(fs.readFile)

    dataObjects = await collectDataObjects();
    await updateDatabase();
    console.log('test1')
    await writeDataObjectModules();
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
     */
    function updateDatabase() {
      return new Promise(async (resolve, reject) => {
        let primary = -1
        let dbQueries = [], results = []
        let dataObject, query, dataObjectAttrs, dataObjectAttr,
          dataObjectAttrProps
        for (dataObject in dataObjects) {
          // TODO : Add logic to check if table columns match data object attrs
          query = "CREATE TABLE IF NOT EXISTS `" + dataObject + '` ('
          dataObjectAttrs = dataObjects[dataObject]
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
          dbQueries.push(db.mysql.queryPromise(query, {}))
        }
        Promise.all(dbQueries)
          .catch(error => engine.debug.error(error))
        resolve()
      })
    }

    /**
     * Write data object module files, containing CRUD operations on the
     * object, that we can use inside the app
     */
    function writeDataObjectModules() {
      return new Promise((resolve, reject) => {
        let fileWrites = [], results = []
        let dataObject, fileContents, fileAppend, dataObjectAttrs, dataObjectAttr, dataObjectAttrProps, dataObjectAttrStr
        let writeFilePromise = promise.denodeify(fs.writeFile)
        for (dataObject in dataObjects) {
          dataObjectAttrs = dataObjects[dataObject]
          // Remove the id attribute from the DO attributes
          // because we don't want to insert IDs, etc.
          if (dataObjectAttrs.id) {
            console.log('test2')
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
            "\tfunction create" + engine.stringFunctions.capitalizeFirstLetter(dataObject) + "("
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
            fileAppend += "?, "
          }
          fileAppend = fileAppend.substring(0, fileAppend.length - 1)
          fileContents += fileAppend + ")',\n" +
            "\t\t\t[" + dataObjectAttrStr + "],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Update function
          fileContents += "\tfunction update" + engine.stringFunctions.capitalizeFirstLetter(dataObject) + "(id," + dataObjectAttrStr + ",callback) {\n" +
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
          fileContents += "\tfunction remove" + engine.stringFunctions.capitalizeFirstLetter(dataObject) + "(id,callback) {\n" +
            "\t\tdb.query('DELETE FROM `" + dataObject + "` WHERE `id`=?)',\n" +
            "\t\t\t[id],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Get singular function
          fileContents += "\tfunction get" + engine.stringFunctions.capitalizeFirstLetter(dataObject) + "(id,callback) {\n" +
            "\t\tdb.query('SELECT * FROM `" + dataObject + "` WHERE `id`=?)',\n" +
            "\t\t\t[id],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
          // Get all function
          fileContents += "\tfunction get" + engine.stringFunctions.capitalizeFirstLetter(dataObject) + "s(id,callback) {\n" +
            "\t\tdb.query('SELECT * FROM `" + dataObject + "` )',\n" +
            "\t\t\t[],\n" +
            "\t\t\tfunction(err, res) {\n" +
            "\t\t\t\tcallback(err, res)\n" +
            "\t\t\t})\n" +
            "\t}\n"
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
