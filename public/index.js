function initSlideshow(slideshow) {
    Array.from(slideshow.querySelectorAll('.slideshow__button')).forEach(function(item) {
        item.addEventListener('click', function (ev) {
            var activeClass = 'slideshow__item slideshow__item--active';
            var active = slideshow.querySelector('.slideshow__item--active');
            // Work out direction
            var dirRight = ev.target.className.indexOf( 'button--right' ) > -1;
            var next = dirRight ? active.nextSibling : active.previousSibling;
            // Move to next
            active.className = 'slideshow__item';
            if ( !next ) {
                next = dirRight ? active.parentNode.firstChild : active.parentNode.lastChild;
            }
            next.className = activeClass;
        } );
    } );
}

if ( Array.from !== undefined ) {
    Array.from(document.querySelectorAll('.slideshow')).forEach(function(slideshow) {
        initSlideshow(slideshow);
    });
}
