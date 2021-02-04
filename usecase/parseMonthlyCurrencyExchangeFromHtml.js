const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery')
const moment = require('moment')
const ParseError = require('../error/ParseError')

/**
 * Turns a string value into a float
 * @param {string} sval String number
 */
function parseAmount(sval) {
    const snorm = sval.replace(/,/g, ".")
    return Number.parseFloat(snorm)
}


const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * @typedef {{date:Date,buy:number,sell:number}} CurrencyExchangeTuple
 */




/**
 * Crea un arreglo con la cotizacion de todas las fechas de un mes
 * @param {Array.<CurrencyExchangeTuple>} input 
 * @returns {Array.<CurrencyExchangeTuple>} Cotizacion completa del mes
 */
function buildMonthlyExchange(input = []) {
    if (input.length == 0) return []

    const year = input[0].date.getUTCFullYear()
    const month = input[0].date.getUTCMonth()
    const monthDays = MONTH_DAYS[input[0].date.getUTCMonth()]

    const exchangeTuples = input.slice().reverse()

    const result = [] // accumulative result

    let prevTuple = null;
    for (let day = monthDays; day >= 1; day--) {
        /** @type {{date:Date,buy:number,sell:number}} */
        const exchangeTuple = exchangeTuples.find(d => d.date.getUTCDate() <= day) || prevTuple || {}
        result.push({ date: new Date(year, month, day, 0), buy: exchangeTuple.buy, sell: exchangeTuple.sell })
        prevTuple = exchangeTuple || prevTuple
    }

    return result
}



module.exports =
    /**
     * Parsea un HTML string y computa las cotizaciones de todo el mes
     * @param {string} data HTML string
     * @returns {Array.<CurrencyExchangeTuple>} Monthly currency exchange
     */
    function (data) {
        try {
            const dom = new JSDOM(data)
            const $ = jquery(dom.window)

            const trows = $("#dataTable tbody tr")

            const parsedValues = []
            trows.each(function (_index) {
                const sdate = $(this).find("td:eq(0)").text()
                const buy = parseAmount($(this).find("td:eq(1)").text())
                const sell = parseAmount($(this).find("td:eq(2)").text())

                const date = moment(sdate, "DD/MM/YYYY").toDate()

                parsedValues.push({ date, buy, sell })
            })

            return buildMonthlyExchange(parsedValues)
        } catch (error) {
            throw new ParseError(error.message)
        }
    }



