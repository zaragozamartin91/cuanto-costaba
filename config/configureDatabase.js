// init sqlite db
const dbFile = "./.data/sqlite.db"
const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database(dbFile)


// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${process.env.CURRENCY_TABLE}(
        currency TEXT,
        year INTEGER,
        month INTEGER,
        day INTEGER,
        buy REAL,
        sell REAL
  )`

    db.run(createTableQuery)
    console.log("New table " + process.env.CURRENCY_TABLE + " ready!")
})


module.exports = db
