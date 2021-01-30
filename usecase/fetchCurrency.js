
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery')
const ParseError = require('../error/ParseError')


const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


function parseAmount(sval) {
    const snorm = sval.replace(/,/g, ".")
    return Number.parseFloat(snorm)
}

module.exports = function (httpsClient) {
    return function getData({ year, month }) {
        return new Promise((resolve, reject) => {
            let html = ''

            const pathSuffix = `${MONTHS[month - 1]}-${year}`

            const options = {
                hostname: 'dolarhistorico.com',
                port: 443,
                path: `/cotizacion-dolar-blue/mes/${pathSuffix}`,
                method: 'GET'
            }

            httpsClient.get(options, function (res) {
                res.on('data', function (data) {
                    // collect the data chunks to the variable named \"html\"
                    html += data
                }).on('end', function () {
                    try {
                        const dom = new JSDOM(html)

                        const $ = jquery(dom.window)
                        const usdBuy = $("#dataTable tbody tr:last td:eq(1)")
                        const usdSell = $("#dataTable tbody tr:last td:eq(1)")

                        const usdBuyNum = parseAmount(usdBuy.text())
                        const usdSellNum = parseAmount(usdSell.text())
                        resolve({ "period": pathSuffix, "buy": usdBuyNum, "sell": usdSellNum })
                    } catch (error) {
                        reject(new ParseError(error.message))
                    }
                })
            })
        })
    }
}