// @ts-check
const sqlite3 = require("sqlite3")

module.exports = /**
 * Builds query function
 * @param {sqlite3.Database} db Database reference
 */
 function (db) {
    const query = `SELECT * FROM ${process.env.CURRENCY_TABLE} WHERE currency=? AND year=? AND month=? AND day=?`

    return function ({ currency, year, month, day }) {
        return new Promise((resolve, reject) => {

            db.get(query, [currency, year, month, day], (err, row) => {
                if (err) reject(err)
                else resolve(row)
            });

        })
    }
}