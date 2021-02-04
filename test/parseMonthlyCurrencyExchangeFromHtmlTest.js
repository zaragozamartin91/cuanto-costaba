const assert = require('assert')
const fs = require('fs')
const moment = require('moment')

const html = fs.readFileSync('./test_resources/cotizacion_dolar_blue_octubre_2020.html')

const sut = require('../usecase/parseMonthlyCurrencyExchangeFromHtml')

const EXPECTED = [
    { date: moment('2020-10-01').toDate(), buy: 141, sell: 147 },
    { date: moment('2020-10-02').toDate(), buy: 144, sell: 150 },
    { date: moment('2020-10-03').toDate(), buy: 144, sell: 150 },
    { date: moment('2020-10-04').toDate(), buy: 144, sell: 150 },
    { date: moment('2020-10-05').toDate(), buy: 144, sell: 150 },
    { date: moment('2020-10-06').toDate(), buy: 146, sell: 152 },
    { date: moment('2020-10-07').toDate(), buy: 149, sell: 155 },
    { date: moment('2020-10-08').toDate(), buy: 152, sell: 158 },
    { date: moment('2020-10-09').toDate(), buy: 161, sell: 167 },
    { date: moment('2020-10-10').toDate(), buy: 161, sell: 167 },
    { date: moment('2020-10-11').toDate(), buy: 161, sell: 167 },
    { date: moment('2020-10-12').toDate(), buy: 161, sell: 167 },
    { date: moment('2020-10-13').toDate(), buy: 160, sell: 166 },
    { date: moment('2020-10-14').toDate(), buy: 161, sell: 167 },
    { date: moment('2020-10-15').toDate(), buy: 165, sell: 171 },
    { date: moment('2020-10-16').toDate(), buy: 172, sell: 178 },
    { date: moment('2020-10-17').toDate(), buy: 172, sell: 178 },
    { date: moment('2020-10-18').toDate(), buy: 172, sell: 178 },
    { date: moment('2020-10-19').toDate(), buy: 175, sell: 181 },
    { date: moment('2020-10-20').toDate(), buy: 174, sell: 180 },
    { date: moment('2020-10-21').toDate(), buy: 177, sell: 183 },
    { date: moment('2020-10-22').toDate(), buy: 184, sell: 190 },
    { date: moment('2020-10-23').toDate(), buy: 189, sell: 195 },
    { date: moment('2020-10-24').toDate(), buy: 189, sell: 195 },
    { date: moment('2020-10-25').toDate(), buy: 189, sell: 195 },
    { date: moment('2020-10-26').toDate(), buy: 184, sell: 190 },
    { date: moment('2020-10-27').toDate(), buy: 175, sell: 181 },
    { date: moment('2020-10-28').toDate(), buy: 172, sell: 178 },
    { date: moment('2020-10-29').toDate(), buy: 169, sell: 175 },
    { date: moment('2020-10-30').toDate(), buy: 163, sell: 169 },
    { date: moment('2020-10-31').toDate(), buy: 163, sell: 169 }
]

describe('parseMonthlyCurrencyExchangeFromHtml', function () {
    describe('main', function () {
        it('should return currency exchange values for every day', function () {
            const values = sut(html)
            values.reverse()


            for (let index = 0; index < values.length; index++) {
                const v = values[index];
                const e = EXPECTED[index];
                assert.strictEqual(v.buy, e.buy, 'Buy values dont match for item ' + index)
                assert.strictEqual(v.sell, e.sell, 'Sell values dont match for item ' + index)
                assert.strictEqual(
                    moment(v.date).format('YYYYMMDD'),
                    moment(e.date).format('YYYYMMDD'),
                    'Date values dont match for item ' + index)
            }
        })
    })
})
