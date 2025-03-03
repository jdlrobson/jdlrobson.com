class ProgressBar extends HTMLElement {
    constructor() {
		super();
    }
	connectedCallback() {
        let pc = parseFloat( this.textContent ) * 100;
        let html = '';
        let total = 0;
        while ( pc > 0 ) {
            html += '█';
            pc -= 10;
            total += 10;
        }
        while ( total < 100 ) {
            html += '░';
            total += 10;
        }

        this.innerHTML = html;

    }
}

if ( !customElements.get( 'progress-bar' ) ) {
	customElements.define( 'progress-bar', ProgressBar );
}
