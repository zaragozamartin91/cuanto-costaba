// imports for setting types
var _pmc = require('./parseMonthlyCurrencyExchangeFromHtml')
var _ht = require('https')


const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/**
 * @typedef {{date:Date,buy:number,sell:number}} CurrencyExchangeTuple
 */

module.exports =
    /**
     * Fetches currency exchange data from dolarhistorico.com and parses it 
     * @param {_ht} httpsClient HTTPS client
     * @param {_pmc} parseMonthlyCurrencyExchangeFromHtml HTML string parser
     * @returns {Promise.<Array.<CurrencyExchangeTuple>>} Monthly currency exchange
     */
    function (httpsClient, parseMonthlyCurrencyExchangeFromHtml) {
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
                            const result = parseMonthlyCurrencyExchangeFromHtml(html)
                            resolve(result || [])
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            })
        }
    }