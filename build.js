const fs = require('fs');
const rss = require('./functions/rss');
const domino = require( 'domino' );
const utils = require( './utils' );

const getmeta = (html) => {
    let image;
    const doc = domino.createWindow().document;
    const node = doc.createElement('div');
    node.innerHTML = html;
    const img = node.querySelector('img');
    const description = node.querySelector('p').textContent;
    const src = img ? img.getAttribute('src') : 'https://jdlrobson.com/gifme-200.gif';
    if(src.indexOf('https://') === -1) {
        image = `https://jdlrobson.com/${src}`;
    } else {
        image = src;
    }
    return {
        description,
        image
    };
};

const slideshow = (items, className, includeImage) => {
    return `<div class="slideshow ${className}">
    <button class="slideshow__button" aria-hidden="true">left</button>
    <ul class="slideshow__items">${items.map((item, i)=>`<li
        class="slideshow__item ${i === 0 ? 'slideshow__item--active':''}">
            ${includeImage ? `<img src="/images/${utils.getImageSrcFromUri(item.url)}.png" alt="screenshot of ${item.url}"/>`: ''}
            <a href="${item.url}">${item.title}</a>
            <span>${item.description}</span>
        </li>`).join('')}</ul>
    <button class="slideshow__button slideshow__button--right" aria-hidden="true">right</button>
</div>`;
};


const buildpage = (path, title, html, stylesheetpath = '/index.css', meta) => {
    if (!meta) {
        meta = getmeta(html);
    }
    fs.writeFileSync(`${__dirname}/public/${path}`, `<!DOCTYPE HTML>
<html lang="en-gb" class="theme-light">
<head>
    <meta property="og:type" content="profile"/>
    <meta property="og:site_name" content="Jon Robson"/>
    <meta property="og:image" content="${meta.image}"/>
    <meta property="og:title" content="${title}"/> 
    <meta property="og:description" content="${meta.description}"/> 
    <meta property="og:url" content="https://jdlrobson.com/${path}"/> 
    <link rel="apple-touch-icon" sizes="180x180" href="/img-home/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/img-home/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/img-home/favicon-16x16.png">
    <link rel="alternate" type="application/rss+xml" title="Journal RSS" href="/rss.xml" />
    <link rel="manifest" href="/site.webmanifest">
    <meta name="google-site-verification" content="mzjjfIIUZtRWhQwfd49STTtZLoyK0WiGkmMQG83ektw">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/common.css" />
    <link rel="stylesheet" href="${stylesheetpath}" />
    <link rel="stylesheet" href="/icons.css" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <title>${title} - By Jon Robson</title>
    <meta name="keywords" content="short stories, writing, web development, javascript" />
    <meta name="Author" content="Jon Robson" />
    <meta name="viewport" content="width=device-width,minimum-scale=0.5,initial-scale=1.0"/>
    <meta name="google-site-verification" content="mzjjfIIUZtRWhQwfd49STTtZLoyK0WiGkmMQG83ektw" />
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9NEW8YRHD9"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-9NEW8YRHD9');
    </script>
    <script>
    (function () {
        const mode = localStorage.getItem('darkmode');
        const classList = document.documentElement.classList;
        if ( mode ) {
            classList.remove( 'theme-light' );
            classList.add( 'theme-dark' );
        }
    }());
    </script>
<body>
<script>
if ( document.querySelectorAll && Array.from !== undefined ) {
    document.documentElement.className += ' client-js';
}
// ie 8 support
document.createElement('article');
document.createElement('section');
document.createElement('nav');
document.createElement('header');
</script>
${html}
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-75478054-1');
</script>
<script src="/index.js"></script>
<button class="darkModeToggle" id="enable-light-mode">☀️</button>
<button class="darkModeToggle" id="enable-dark-mode">🌙</button>
</body>
</html>`);
console.log(`Built page ${path}`)
};

const ABOUTME = `<header id="me">
<a href="/"><img src="/img-home/jdlr.jpg" title="Jon Robson"></a>
<p>I'm Jon Robson, a Welsh/English/European/adopted-Singaporean <a href="https://github.com/jdlrobson">open source web developer</a> and <a href="https://littledailydose.com/">published writer</a> living in San Francisco.</p>
<ul class="icons">
    <li><a class="icon--tweet" href="https://twitter.com/jdlrobson">Twitter</a></li>
    <li><a href="/rss.xml"><img src="/images/rss.png" alt="rss link"></a></li>
</ul>
</header>`;

function makePosts() {
    const postsfolder = `${__dirname}/content/posts/`;
    const posts = fs.readdirSync(postsfolder);
    const namedPosts = [];
    // All blog posts must look like <body>....</body>
    for (var i=0; i<posts.length; i++) {
        const filename = posts[i];
        const blog = fs.readFileSync(`${postsfolder}/${filename}`).toString();
        const startIndex = blog.indexOf('<body>') + '<body>'.length;
        const endIndex = blog.indexOf('</body>');
        const parts = filename.split('_');
        const title = parts[1].split('-').slice(0, -1).join(' ');
        const html = `<nav><a href="/">Jon Robson</a> &gt; <a href="/posts/">Blog posts</a> &gt; <span>${title}</span></nav>`
            + blog.substr(startIndex, endIndex - startIndex) + ABOUTME;
        // important to rename ' to - to match medium uris
        const savefilename = filename.replace(/'/g, '-')
        const path = `posts/${savefilename}`;
        const published = new Date(parts[0]);
        buildpage(path, title, html, '/posts.css');
        namedPosts.push( { title, path, published } );
    }
    const postindexhtml = `
<nav><a href="/">Jon Robson</a></nav>
<article>
<section>
<h3>Blog posts</h3>
<ul>
${namedPosts.sort((p, p2)=>p.published < p2.published ? 1 : -1)
    .map((post) => `<li><a href="/${post.path}">${post.title}</a> <div>${post.published.toDateString()}</div></li>`).join('')}
</ul>
</section>
</article>
${ ABOUTME }`;
    buildpage(`posts/index.html`, `Jon Robson's blog posts`, postindexhtml, '/posts.css');
}

function makeHome() {
    const homeheader = fs.readFileSync(`${__dirname}/content/index__header.html`);
    const projects = JSON.parse(fs.readFileSync(`${__dirname}/content/projects.json`));
    const homefooter = fs.readFileSync(`${__dirname}/content/index__footer.html`);
    const technical = JSON.parse(fs.readFileSync(`${__dirname}/content/technical.json`));
    const fiction = JSON.parse(fs.readFileSync(`${__dirname}/content/fiction.json`));
    const html = `
    <article>
    ${homeheader}
    <section id="writes">
    <h2>Technical writing</h2>
    ${slideshow(technical.filter((a) => !a.hidden))}
    </section>
    <section id="writes-fiction">
    <h2>fiction / non-fiction</h2>
    ${slideshow(fiction)}
    </section>
    <section id="websites">
    <h2>projects</h2>
    ${slideshow(projects, 'slideshow--projects', true)}
    <p>Other clients include <a href="//ilga.org">ilga.org</a>, <a href=""http://tunbridgewellswintershelter.co.uk">tunbridge wells winter shelter</a>, <a href="https://bt.com">BT Group (internal)</a>, <a href="https://notesmusiccoffee.com">notesmusiccoffee</a>.</p>
    </section>
    ${homefooter}</article>
    `;
    buildpage(`index.html`, `Jon Robson's personal site`, html, '/index.css');
}

function makerss() {
    console.log('making RSS');
    rss.makerss(true).then((html) => {
        fs.writeFileSync(`${__dirname}/public/rss.xml`, html);
    }, () => {
        console.warn( 'Error generating RSS');
    });
}

makeHome();
makePosts();
makerss();
