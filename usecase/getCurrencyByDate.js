const _qc = require('./queryCurrencyByDate')
const _sc = require('./storeMultipleCurrencies')
const _fmce = require('./fetchMonthlyCurrencyExchange')

const MissingItemError = require('../error/MissingItemError')
const ValidationError = require('../error/ValidationError')

/**
 * Validates DATE query data
 * @param {number} year Year
 * @param {number} month Month from 1 to 12
 * @param {day} day Day from 1 to 31
 */
async function validateParams(year = 0, month = 0, day = 0) {
    if (isNaN(year)) throw new ValidationError(`Año debe ser numerico!`)

    if (isNaN(month)) throw new ValidationError(`Mes debe ser numerico!`)

    if (year < 2010) throw new ValidationError(`La fecha de consulta debe ser posterior a 2010!`)

    const monthOk = month >= 1 && month <= 12
    if (!monthOk) throw new ValidationError(`Mes ${month} invalido. El valor debe estar entre 1 y 12 inclusive`)

    const today = new Date()
    const queryDate = new Date(year, month - 1, day) // UTC month goes from 0 to 11
    if (queryDate.getTime() > today.getTime()) throw new ValidationError(`${day}/${month}/${year} corresponde a una fecha futura`)
}


module.exports =
    /**
     * Looks for a currency value in the DB, if absent, fetches the value from a website then stores the value
     * @param {_qc} queryCurrency 
     * @param {_sc} storeMultipleCurrencies 
     * @param {_fmce} fetchMonthlyCurrencyExchange 
     */
    function (queryCurrency, storeMultipleCurrencies, fetchMonthlyCurrencyExchange) {
        return async function ({ currency, year, month, day }, doCache = true) {
            await validateParams(year, month, day)

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
                if (doCache) {
                    console.log("Storing exchange values in cache!")
                    storeMultipleCurrencies(inputData)
                }
                const result = monthlyCurrencyExchange.find(c => c.date.getUTCDate() == day)
                console.log("result: ")
                console.log(result)
                return result
            }

            const prettyPrint = { currency, year, month };
            throw new MissingItemError(`No se encontraron datos para ${prettyPrint}`)
        }
    }