const getImageSrcFromUri = (url) => {
    const protocol = url.split('//');
    let img;
    if ( protocol[1] ) {
        img = protocol[1].split('/')[0];
    } else {
        img = url.split('/')[1];
    }

    // get rid of dots.
    img = img.replace(/\./g, '-');
    return `${img}`;
};

module.exports = {
    getImageSrcFromUri
};
