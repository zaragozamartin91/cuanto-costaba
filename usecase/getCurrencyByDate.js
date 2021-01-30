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

module.exports = function (queryCurrency, storeCurrency, fetchCurrency) {
    return async function ({ currency, year, month, day }) {
        await validateParams(year, month)

        const queryValue = await queryCurrency({ currency, year, month, day });
        if (queryValue) return queryValue;

        const fetchValue = await fetchCurrency({ year, month })
        if (fetchValue) {
            storeCurrency({ currency, year, month, day, buy: fetchValue.buy, sell: fetchValue.sell })
            return fetchValue
        }

        const prettyPrint = { currency, year, month };
        throw new MissingItemError(`No se encontraron datos para ${prettyPrint}`)
    }
}