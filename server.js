// server.js
// where your node app starts

// init project
const https = require('https')
const fetchCurrency = require('./usecase/fetchCurrency')(https)
const db = require('./config/configureDatabase')
const queryCurrencyByDate = require('./usecase/queryCurrencyByDate')(db)
const storeCurrency = require('./usecase/storeCurrency')(db)
const getCurrencyByDate = require('./usecase/getCurrencyByDate')(queryCurrencyByDate, storeCurrency, fetchCurrency);

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));


app.get('/hello', (_req, res) => {
    res.status(200).send('Hello world')
})

app.get('/currency-exchange/usd/year/:year/month/:month', async (req, res, next) => {
    console.log("params: ", req.params)

    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)

    try {
        const info = await getCurrencyByDate({ currency: 'usd', year, month, day: 0 })
        res.status(200).send({ "compra": info.buy, "venta": info.sell, "a\u0148o": year, "mes": month })
    } catch (error) { next(error) }
})

app.use(function (err, req, res, next) {
    const handlers = {
        "validation": cause => res.status(400).send({ msg: "Error de validacion", cause }),
        "parse": cause => res.status(500).send({ msg: "Error de obtencion de datos", cause }),
        "missing": cause => res.status(404).send({ msg: "Valor no encontrado", cause })
    }
    const handler = handlers[err.kind] || function (cause) { res.status(500).send({ msg: "Error desconocido", cause }) }
    handler(err.message)
})


// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
});