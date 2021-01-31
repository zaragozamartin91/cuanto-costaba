// @ts-check
const sqlite3 = require("sqlite3")

module.exports = /**
 * Builds store function
 * @param {sqlite3.Database} db Database reference
 */
    function (db) {
        return function (data) {
            return new Promise((resolve, reject) => {
                const placeholders = data.map((_d) => '(?,?,?,?,?,?)').join(',');
                const insertQuery = `INSERT INTO ${process.env.CURRENCY_TABLE}(currency, year, month, day, buy, sell) VALUES ${placeholders}`

                console.log("Query: ", insertQuery)

                const params = []
                data.forEach(e => {
                    const { currency, year, month, day, buy, sell } = e
                    params.push(currency, year, month, day, buy, sell)
                });

                console.log("Params: ", params)

                db.run(insertQuery, params, function (err) {
                    if (err) return reject(err);
                    // get the last insert id
                    console.log(`Rows inserted ${this.changes}`)
                    resolve(this.changes)
                });
            })
        }
    }