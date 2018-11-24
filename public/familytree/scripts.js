var HIDE_LABEL = 'hide children';

Array.from( document.querySelectorAll( '.person__children' ) ).forEach(( block ) => {
  let btn = document.createElement('button');
  btn.textContent = HIDE_LABEL;
  handler = (function (b) {
    return (ev) => {
      btn.textContent = b.style.display === '' ? 'show children' : HIDE_LABEL;
      b.style.display = b.style.display === '' ? 'none' : '';
    };
  }(block));
  btn.addEventListener( 'click', handler);
  block.parentNode.insertBefore(btn, block);
});
