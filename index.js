const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery')
const https = require('https')


const express = require('express')
const app = express()
const port = 3000


const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


app.get('/cotizaciones/usd/:year/:month', (req, res) => {
    console.log("params: ", req.params)

    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)

    try {
        validateParams(year, month)
    } catch (error) {
        return res.status(400).send(error.message)
    }

    getData(year, month, info => res.status(200).send(info))
})


function validateParams(year = 0, month = 0) {
    const yearOk = year >= 2010 && year <= 2021
    const monthOk = month >= 1 && month <= 12
    if (!yearOk) {
        throw new Error(`El año ${year} debe ser mayor o igual a 2010!`)
    }
    if (!monthOk) {
        throw new Error(`El mes ${month} debe ser entre 1 y 12 inclusive`)
    }
}

function getData(year, month, callback) {
    var html = '';

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
            console.log("html is ", html)
            const dom = new JSDOM(html);

            const $ = jquery(dom.window);
            const usdBuy = $("#dataTable tbody tr:last td:eq(1)")
            const usdSell = $("#dataTable tbody tr:last td:eq(1)")

            const usdBuyNum = Number.parseFloat(usdBuy.text().replace(/,/g, "."))
            const usdSellNum = Number.parseFloat(usdSell.text().replace(/,/g, "."))

            callback({"periodo": pathSuffix, "compra": usdBuyNum, "venta": usdSellNum})
        });
    });
}


app.listen(port, () => {
    console.log(`cuanto_costaba listening at http://localhost:${port}`)
})