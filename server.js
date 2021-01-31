// server.js
// where your node app starts

// init project
const https = require('https')
const parseMonthlyCurrencyExchangeFromHtml = require('./usecase/parseMonthlyCurrencyExchangeFromHtml')
const fetchMonthlyCurrencyExchange = require('./usecase/fetchMonthlyCurrencyExchange')(https, parseMonthlyCurrencyExchangeFromHtml)
const db = require('./config/configureDatabase')
const queryCurrencyByDate = require('./usecase/queryCurrencyByDate')(db)
const storeMultipleCurrencies = require('./usecase/storeMultipleCurrencies')(db)
const getCurrencyByDate = require('./usecase/getCurrencyByDate')(queryCurrencyByDate, storeMultipleCurrencies, fetchMonthlyCurrencyExchange);

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));


app.get('/hello', (_req, res) => {
    res.status(200).send('Hello world')
})

app.get('/currency-exchange/usd/year/:year/month/:month/day/:day', async (req, res, next) => {
    console.log("Requesting USD currency exchage for: ", req.params)

    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)
    const day = Number.parseInt(req.params.day)

    try {
        const info = await getCurrencyByDate({ currency: 'usd', year, month, day })
        res.status(200).send({ "compra": info.buy, "venta": info.sell, "a\u0148o": year, "mes": month, "dia": day })
    } catch (error) { next(error) }
})

app.use(function (err, req, res, next) {
    const handlers = {
        "validation": cause => res.status(400).send({ msg: "Error de validacion", cause }),
        "parse": cause => res.status(500).send({ msg: "Error de obtencion de datos", cause }),
        "missing": cause => res.status(404).send({ msg: "Valor no encontrado", cause })
    }
    const handler = handlers[err.kind] || function (cause) { res.status(500).send({ msg: "Error desconocido", cause }) }
    console.error(err)
    handler(err.message)
})


// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
});