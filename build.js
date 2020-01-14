const fs = require('fs');

const folder = `${__dirname}/posts/`;
const items = fs.readdirSync(folder);
 
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
<nav>
    <a href="/">About me</a>
</nav>
${html}
<header id="me">
    <img src="/img-home/jdlr.jpg" title="Jon Robson">
    <p>I'm Jon Robson, a Welsh/English/European/adopted-Singaporean open source web developer and writer living in San Francisco.</p>
    <ul class="icons">
        <li><a class="icon--tweet" href="https://twitter.com/jdlrobson">Twitter</a></li>
    </ul>
</header>
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

// All blog posts must look like <body>....</body>
for (var i=0; i<items.length; i++) {
    const filename = items[i];
    const blog = fs.readFileSync(`${folder}/${filename}`).toString();
    const startIndex = blog.indexOf('<body>') + '<body>'.length;
    const endIndex = blog.indexOf('</body>');
    const html = blog.substr(startIndex, endIndex - startIndex);
    const parts = filename.split('_');
    const title = parts[1].split('-').slice(0, -1).join(' ');
    const path = `posts/${filename}`;
    buildpage(path, title, html, '/posts.css');
}