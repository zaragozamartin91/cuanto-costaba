// server.js
// where your node app starts

// init project
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery')
const https = require('https')

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS currencies(
        currency TEXT,
        year INTEGER,
        month INTEGER,
        day INTEGER,
        value REAL
  )`

    if (!exists) {
        db.run(createTableQuery);
        console.log("New table currencies created!");
    } else {
        console.log('Database "currencies" ready to go!');
    }
});


const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

app.get('/hello', (req, res) => {
    res.status(200).send('Hello world')
})

app.get('/cotizaciones/usd/:year/:month', (req, res) => {
    console.log("params: ", req.params)

    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)

    try {
        validateParams(year, month)
    } catch (error) {
        return res.status(400).send(error.message)
    }

    getData(year, month, function (err, info) {
        if (err) res.status(500).send(err)
        else res.status(200).send({
            "periodo": info.period, "compra": info.buy, "venta": info.sell, "anio": year, "mes": month
        });
    })
})




function validateParams(year = 0, month = 0) {
    if (isNaN(year)) throw new Error(`Año debe ser numerico!`)

    if (isNaN(month)) throw new Error(`Mes debe ser numerico!`)

    const today = new Date()
    const currentYear = today.getFullYear()
    const yearOk = year >= 2010 && year <= currentYear
    if (!yearOk) throw new Error(`Año ${year} invalido. El valor debe ser mayor o igual a 2010!`)

    const currentMonth = today.getMonth() + 1
    const futureDate = year == currentYear && month > currentMonth
    if (futureDate) throw new Error(`Año ${year}, Mes ${month} corresponde a una fecha futura`)

    const monthOk = month >= 1 && month <= 12
    if (!monthOk) throw new Error(`Mes ${month} invalido. El valor debe estar entre 1 y 12 inclusive`)

}

function getData(year, month, callback) {
    let html = '';

    const pathSuffix = `${MONTHS[month - 1]}-${year}`

    const options = {
        hostname: 'dolarhistorico.com',
        port: 443,
        path: `/cotizacion-dolar-blue/mes/${pathSuffix}`,
        method: 'GET'
    }

    https.get(options, function (res) {
        res.on('data', function (data) {
            // collect the data chunks to the variable named \"html\"
            html += data;
        }).on('end', function () {
            try {
                const dom = new JSDOM(html);

                const $ = jquery(dom.window);
                const usdBuy = $("#dataTable tbody tr:last td:eq(1)")
                const usdSell = $("#dataTable tbody tr:last td:eq(1)")

                const usdBuyNum = parseAmount(usdBuy.text())
                const usdSellNum = parseAmount(usdSell.text())
                callback(null, { "period": pathSuffix, "buy": usdBuyNum, "sell": usdSellNum })
            } catch (error) {
                callback(error, null)
            }
        });
    });
}

function parseAmount(sval) {
    const snorm = sval.replace(/,/g, ".")
    return Number.parseFloat(snorm);
}


// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
});