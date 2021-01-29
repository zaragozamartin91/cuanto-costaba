const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery')
const https = require('https')

const options = {
    hostname: 'dolarhistorico.com',
    port: 443,
    path: '/cotizacion-dolar-blue/mes/enero-2020',
    method: 'GET'
}

var html = '';
https.get(options, function (res) {
    res.on('data', function (data) {
        // collect the data chunks to the variable named \"html\"
        html += data;
    }).on('end', function () {
        console.log("html is ", html)
        const dom = new JSDOM(html);

        const $ = jquery(dom.window);
        const usd = $("#dataTable tbody tr:last td:eq(1)")
    
        console.log("pure usd: ", usd)
        console.log("usd cost: ", usd.text())
    });
});