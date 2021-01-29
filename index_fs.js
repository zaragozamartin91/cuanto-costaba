const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery')
const fs = require('fs')

fs.readFile('cotizacion_dolar_blue_enero_2020.html', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    console.log("html is ", data)
    const dom = new JSDOM(data);

    const $ = jquery(dom.window);
    const usd = $("#dataTable tbody tr:last td:eq(1)")

    console.log("pure usd: ", usd)

    //   const usd = dom.window.document.querySelector("#dataTable tbody tr:last td:eq(1)").textContent

    console.log("usd cost: ", usd.text())
});

