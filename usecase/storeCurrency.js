// @ts-check
const sqlite3 = require("sqlite3")

module.exports = /**
 * Builds store function
 * @param {sqlite3.Database} db Database reference
 */
 function (db) {
    const insertQuery = `INSERT INTO ${process.env.CURRENCY_TABLE}(currency, year, month, day, buy, sell) VALUES(?,?,?,?,?,?)`

    return function ({ currency, year, month, day, buy, sell }) {
        return new Promise((resolve, reject) => {
            db.run(insertQuery, [currency, year, month, day, buy, sell], function (err) {
                if (err) return reject(err);
                // get the last insert id

                const pp = { currency, year, month, day, buy, sell }
                console.log(`Row ${JSON.stringify(pp)} stored with id ${this.lastID}`)
                resolve(this.lastID)
            });
        })
    }
}