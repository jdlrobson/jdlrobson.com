const fs = require('fs');
 
const slideshow = (items) => {
    return `<div class="slideshow">
    <button class="slideshow__button">left</button>
    <ul class="slideshow__items">${items.map((item, i)=>`<li
        class="slideshow__item ${i === 0 ? 'slideshow__item--active':''}">
            <a href="${item.url}">${item.title}</a>
            <span>${item.description}</span>
        </li>`)}</ul>
    <button class="slideshow__button slideshow__button--right">right</button>
</div>`;
};

const buildpage = (path, title, html, stylesheetpath = '/index.css') => {
    fs.writeFileSync(`${__dirname}/public/${path}`, `<!DOCTYPE HTML>
<html lang="en-gb">
<head>
    <meta property="og:type" content="profile/>
    <meta property="og:site_name" content="Jon Robson"/>
    <meta property="og:image" content="https://jdlrobson.com/gifme-200.gif"/>
    <meta property="og:title" content="${title}"/> 
    <meta property="og:url" content="https://jdlrobson.com/${path}"/> 
    <link rel="apple-touch-icon" sizes="180x180" href="/img-home/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/img-home/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/img-home/favicon-16x16.png">
    <link rel="alternate" type="application/rss+xml" title="Journal RSS" href="/.netlify/functions/rss" />
    <link rel="manifest" href="/site.webmanifest">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="stylesheet" href="${stylesheetpath}" />
    <link rel="stylesheet" href="/icons.css" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <title>${title} - By Jon Robson</title>
    <meta name="keywords" content="short stories, writing, web development, javascript" />
    <meta name="Author" content="Jon Robson" />
    <meta name="viewport" content="width=device-width,minimum-scale=0.5,maximum-scale=1,user-scalable=0,initial-scale=1.0"/>
    <meta name="google-site-verification" content="mzjjfIIUZtRWhQwfd49STTtZLoyK0WiGkmMQG83ektw" />
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-75478054-1"></script>
<body>
<script>
if ( document.querySelectorAll && Array.from !== undefined ) {
    document.body.className += ' client-js';
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
</body>
</html>`)
};

const ABOUTME = `<header id="me">
<a href="/"><img src="/img-home/jdlr.jpg" title="Jon Robson"></a>
<p>I'm Jon Robson, a Welsh/English/European/adopted-Singaporean open source web developer and writer living in San Francisco.</p>
<ul class="icons">
    <li><a class="icon--tweet" href="https://twitter.com/jdlrobson">Twitter</a></li>
    <li><a href="/.netlify/functions/rss"><img src="/images/rss.png" alt="rss link"></a></li>
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
        const html = `<nav><a href="/posts/">Blog posts</a></nav>`
            + blog.substr(startIndex, endIndex - startIndex) + ABOUTME;
        const parts = filename.split('_');
        const title = parts[1].split('-').slice(0, -1).join(' ');
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
    const homewebsites = fs.readFileSync(`${__dirname}/content/index__websites.html`);
    const homefooter = fs.readFileSync(`${__dirname}/content/index__footer.html`);
    const technical = JSON.parse(fs.readFileSync(`${__dirname}/content/technical.json`));
    const fiction = JSON.parse(fs.readFileSync(`${__dirname}/content/fiction.json`));
    const html = `
    <article>
    ${homeheader}
    <section id="writes">
    <h2>Technical writing</h2>
    ${slideshow(technical)}
    </section>
    <section id="writes-fiction">
    <h2>fiction / non-fiction</h2>
    ${slideshow(fiction)}
    </section>
    ${homewebsites}${homefooter}</article>
    `;
    buildpage(`index.html`, `Jon Robson's personal site`, html, '/index.css');
}

makeHome();
makePosts();
