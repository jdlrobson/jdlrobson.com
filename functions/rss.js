const RSS = require('rss');
const fetch = require('node-fetch');
const xml2js = require('xml2js-es6-promise');

exports.handler = function (_event, _context, callback) {

    const feed = new RSS({
        title: 'Jon Robson',
        description: 'Things about Jon'
    });
    Promise.all(
        [
            fetch( 'https://medium.com/feed/@dlyall' ).then((response) => response.text())
                .then((xml) => xml2js(xml)),
            fetch( 'https://www.instagram.com/jdlrobson/?__a=1' ).then(response=>response.json())
        ]
    )
        .then(([ mediumdata, igdata ] )=> {
            let igramposts;
            try {
                igramposts = igdata.graphql.user.edge_owner_to_timeline_media.edges;
            } catch (e) {
                igramposts = [];
            }

            // extract from igram
            igramposts.forEach((post) => {
                let title, caption;
                const node = post.node;
                try {
                    caption = node.edge_media_to_caption.edges[0].node.text;
                    title = caption
                        .match(/([A-Z: \\n]+)/)[0];
                    if ( title.length > 1 ) {
                        feed.item( {
                            title,
                            description: caption,
                            enclosure: {
                                url: node.thumbnail_src,
                                type: 'image/jpeg'
                            },
                            url: `https://www.instagram.com/p/${node.shortcode}/`,
                            date: new Date( node.taken_at_timestamp * 1000 )
                        });
                    }
                } catch (e) {
                    // no title.
                }
            })
            // extract from medium
            mediumdata.rss.channel[0].item.forEach((item) => {
                if ( item.category) {
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
