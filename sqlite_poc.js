const db = require('./config/configureDatabase')
const storeCurrency = require('./usecase/storeCurrency')(db)
const queryCurrency = require('./usecase/queryCurrencyByDate')(db)

async function main() {
    const id = await storeCurrency({currency: 'usd', year: 1991, month: 03, day: 21, buy: 3.5, sell: 3.6})
    console.log("inserted id: ", id)
    const record = await queryCurrency({currency: 'usd', year: 1991, month: 03, day: 21})
    return record
}

async function queryMissing() {
    const record = await queryCurrency({currency: 'ars', year: 1991, month: 03, day: 21})
    return record
}

main().then(r => console.log("record: ", r)).finally(() => db.close())


