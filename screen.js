const projects = require('./content/projects.json');
const utils = require( './utils' );
const Pageres = require('pageres');
const fs = require('fs');
const sharp = require('sharp');

const options = {
    delay: 2
};

projects.forEach((p) => {
    let url = p.url;
    const DIR = `${__dirname}/public/images/`;
    const filename = utils.getImageSrcFromUri(url);
    if (url.indexOf('/') === 0) {
        url = `https://jdlrobson.com${url}`;
    }
    console.log(`Building screenshot for ${url}`);
    (async () => {
        await new Pageres(options)
            .src(url, [`1920x1080`],
                {filename, crop: true, script: p.script}
            )
            .dest(DIR)
            .run();
            
        console.log(`Built screenshot for ${url}`);
        sharp(fs.readFileSync(`${DIR}/${filename}.png`))
            .resize(320)
            .toFile(`${DIR}/${filename}.png`, (err, info) => {
                if (err) {
                    console.log('Error resizing');
                } else {
                    console.log(`Resized ${filename}`)
                }
            });
    })();
})

