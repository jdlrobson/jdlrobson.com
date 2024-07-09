var COIN_CLASS = 'slideshow__counter__coin';
var ACTIVE_COIN_CLASS = COIN_CLASS + ' slideshow__counter__coin--active'

function initSlideshow(slideshow) {
    var coin, activeCoin = 0, coins;
    var items = slideshow.querySelectorAll( '.slideshow__items' );
    var num = slideshow.querySelectorAll('.slideshow__item').length;
    var indicators = document.createElement( 'ul' );
    indicators.className = 'slideshow__counter';
    for ( var i = 0; i < num; i++ ) {
        coin = document.createElement( 'li' );
        coin.className = COIN_CLASS;
        indicators.appendChild( coin );
    }
    coins = indicators.childNodes;
    coins[activeCoin].className = ACTIVE_COIN_CLASS;
    slideshow.insertBefore( indicators, items.nextSibling );
    Array.from(slideshow.querySelectorAll('.slideshow__button')).forEach(function(item) {
        item.addEventListener('click', function (ev) {
            var activeClass = 'slideshow__item slideshow__item--active';
            var active = slideshow.querySelector('.slideshow__item--active');
            // Work out direction
            var dirRight = ev.target.className.indexOf( 'button--right' ) > -1;
            var next = dirRight ? active.nextSibling : active.previousSibling;
            // Move to next
            active.className = 'slideshow__item';
            // update coin
            coins[activeCoin].className = COIN_CLASS;
            activeCoin += dirRight ? 1 : -1;
            if ( !next ) {
                activeCoin = dirRight ? 0 : coins.length - 1;
                next = dirRight ? active.parentNode.firstChild : active.parentNode.lastChild;
            }
            // update new coin
            coins[activeCoin].className = ACTIVE_COIN_CLASS;
            next.className = activeClass;
        } );
    } );
}

if ( Array.from !== undefined ) {
    Array.from(document.querySelectorAll('.slideshow')).forEach(function(slideshow) {
        initSlideshow(slideshow);
    });
}

document.body.addEventListener( 'click', ( ev ) => {
    const target = ev.target;
    const classList = document.documentElement.classList;
    if ( target.id === 'enable-dark-mode' ) {
        classList.remove( 'theme-light' );
        classList.add( 'theme-dark' );
        localStorage.setItem( 'darkmode', '1' );
    } else if ( target.id === 'enable-light-mode' ) {
        classList.remove( 'theme-dark' );
        classList.add( 'theme-light' );
        localStorage.removeItem( 'darkmode' );

    }
    
} );