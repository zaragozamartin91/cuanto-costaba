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

    const lastDay = moment(input[0].date).endOf('month').startOf('day')
    const exchangeTuples = input.slice().reverse() // cloning the array and reversing it

    /**
     * @param {moment.Moment} m 
     * @param {CurrencyExchangeTuple} prevTuple 
     * @param {Array.<CurrencyExchangeTuple>} acc 
     */
    function solve(m, prevTuple, acc = []) {
        const exchangeTuple = exchangeTuples.find(et => moment(et.date).date() <= m.date()) || prevTuple || {}
        acc.push({ date: m.toDate(), buy: exchangeTuple.buy, sell: exchangeTuple.sell })
        return m.date() == 1 ? acc : solve(m.subtract(1, 'days'), exchangeTuple || prevTuple, acc)
    }

   return solve(lastDay, null)
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



