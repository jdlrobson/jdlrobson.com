const RSS = require('rss');
const fetch = require('node-fetch');
const xml2js = require('xml2js-es6-promise');
exports.handler = function (_event, _context, callback) {

    const feed = new RSS({
        title: 'Jon Robson',
        description: 'Things about Jon'
    });
    fetch( 'https://medium.com/feed/@dlyall' ).then((response) => response.text())
        .then((xml)=> {
            return xml2js(xml);
        })
        .then((data) => {
            data.rss.channel[0].item.forEach((item) => {
                if ( item.category) {
                    console.log(item.title[0]);
                    feed.item( {
                        title: item.title[0],
                        description: item.description || item['content:encoded'][0],
                        url: item.link[0],
                        date: item.pubDate[0]
                    })
                }
            });
            callback(null, {
                headers: {
                    'content-type': 'text/xml'
                },
                statusCode: 200,
                body: feed.xml({indent: true})
              })
        });
}
