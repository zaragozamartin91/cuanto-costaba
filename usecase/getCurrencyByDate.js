const _qc = require('./queryCurrencyByDate')
const _sc = require('./storeMultipleCurrencies')
const _fmce = require('./fetchMonthlyCurrencyExchange')

const MissingItemError = require('../error/MissingItemError')
const ValidationError = require('../error/ValidationError')

async function validateParams(year = 0, month = 0) {
    if (isNaN(year)) throw new ValidationError(`Año debe ser numerico!`)

    if (isNaN(month)) throw new ValidationError(`Mes debe ser numerico!`)

    const today = new Date()
    const currentYear = today.getFullYear()
    const yearOk = year >= 2010 && year <= currentYear
    if (!yearOk) throw new ValidationError(`Año ${year} invalido. El valor debe ser mayor o igual a 2010!`)

    const currentMonth = today.getMonth() + 1
    const futureDate = year == currentYear && month > currentMonth
    if (futureDate) throw new ValidationError(`Año ${year}, Mes ${month} corresponde a una fecha futura`)

    const monthOk = month >= 1 && month <= 12
    if (!monthOk) throw new ValidationError(`Mes ${month} invalido. El valor debe estar entre 1 y 12 inclusive`)

}


module.exports =
    /**
     * Looks for a currency value in the DB, if absent, fetches the value from a website then stores the value
     * @param {_qc} queryCurrency 
     * @param {_sc} storeMultipleCurrencies 
     * @param {_fmce} fetchMonthlyCurrencyExchange 
     */
    function (queryCurrency, storeMultipleCurrencies, fetchMonthlyCurrencyExchange) {
        return async function ({ currency, year, month, day }) {
            await validateParams(year, month)

            const queryValue = await queryCurrency({ currency, year, month, day });
            if (queryValue) return queryValue;

            const monthlyCurrencyExchange = await fetchMonthlyCurrencyExchange({ year, month })
            if (monthlyCurrencyExchange.length > 0) {
                // storing currency exchange in sqlite cache
                const inputData = monthlyCurrencyExchange.map(c => {
                    return {
                        currency, year, month, day: c.date.getUTCDate(), buy: c.buy, sell: c.sell
                    }
                })
                storeMultipleCurrencies(inputData)
                const result = monthlyCurrencyExchange.find(c => c.date.getUTCDate() == day)
                console.log("result: ")
                console.log(result)
                return result
            }

            const prettyPrint = { currency, year, month };
            throw new MissingItemError(`No se encontraron datos para ${prettyPrint}`)
        }
    }