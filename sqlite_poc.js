const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/currency.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the currency database.');
});


const createTableQuery = `CREATE TABLE IF NOT EXISTS currencies(
      currency TEXT,
      year INTEGER,
      month INTEGER,
      day INTEGER,
      value REAL
)`


db.run(createTableQuery)

const insertCurrencyQuery = `INSERT INTO 
    currencies(currency,year,month,day,value) 
    VALUES(?,?,?,?,?)`

db.run(insertCurrencyQuery, ['USD', 2020, 10, 0, 140.50], function (err) {
    if (err) {
        return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
});

db.get('SELECT * FROM currencies WHERE currency=?', ['USD'], (err, row) => {
    if (err) return console.error(err.message);
    return row
        ? console.log(row)
        : console.log(`No currency found with the id USD`);

})

db.close()

