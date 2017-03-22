/**
* packetManager.js
* A file to serve as a master manager for all packets
* the app will have to interact with.
*/

module.exports = (engine, db, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let dataObjects
    let readdirAsync = promise.denodeify(fs.readdir)
    let readfileAsync = promise.denodeify(fs.readFile)

    dataObjects = await collectDataObjects();
    await updateDatabase();
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
        let filePath = __dirname + "/resources/data/dataObjects"
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
  })
}
