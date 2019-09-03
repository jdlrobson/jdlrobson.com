const fetch = require('node-fetch');
const xml2js = require('xml2js-es6-promise');

function handler(_event, _context, callback) {
    fetch( 'https://medium.com/feed/@dlyall' ).then((response) => response.text())
        .then((xml)=> {
            return xml2js(xml);
        })
        .then((data) => {
            callback({
                statusCode: 200,
                body: JSON.stringify(data.rss.channel[0].item)
              })
        });
}

module.exports = handler;
