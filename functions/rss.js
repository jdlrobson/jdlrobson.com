const RSS = require('rss');
const fetch = require('node-fetch');
const fs = require('fs');
const xml2js = require('xml2js-es6-promise');

const getpath = (url) => {
    if (url.includes('@dlyall')) {
        return url.split('medium.com/@dlyall/')[1]
    } else if (url.includes('/freely-sharing-the-sum-of-all-knowledge/')) {
        return url.split('/freely-sharing-the-sum-of-all-knowledge/')[1]
    } else {
        return url;
    }
}

function makerss(uselocal = false) {
    let localposts = [];
    const feed = new RSS({
        title: 'Jon Robson',
        description: 'Things about Jon'
    });
    if (uselocal) {
        localposts = fs.readdirSync(`${__dirname}/../public/posts`)
            .map((p) => p.toLowerCase().split('_')[1]);
    }
    return Promise.all(
        [
            fetch( 'https://medium.com/feed/@dlyall', {
                headers: {
                    'Content-Type': 'text/html',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
                }
            } ).then((response) => response.text())
                .then((xml) => xml2js(xml))
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
                    let url = item.link[0];
                    // eg. https://medium.com/@dlyall/why-all-software-engineers-should-wear-a-ring-on-their-little-right-finger-31c82403b2eb
                    let filename = getpath(url);
                    if (filename && localposts.length) {
                        filename = filename.split('?')[0];
                        if (localposts.includes(filename) > -1) {
                            url = `https://jdlrobson.com/posts/${filename}.html`;
                        }
                    }
                    feed.item( {
                        title: item.title[0],
                        description: item.description || item['content:encoded'][0],
                        url,
                        date: item.pubDate[0]
                    })
                }
            });
            return feed.xml({indent: true});
        });
}

function handler(_event, _context, callback) {
    makerss().then((body) => {
        callback(null, {
            headers: {
                'content-type': 'text/xml'
            },
            statusCode: 200,
            body
          })
    })
    
}

module.exports = {
    makerss,
    handler
}