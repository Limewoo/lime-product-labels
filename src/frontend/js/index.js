import '../scss/index.scss';

// Move single-product labels from inside the FlexSlider wrapper to the outer
// gallery div, so they stay fixed when gallery slides change.
document.addEventListener( 'DOMContentLoaded', () => {
	document
		.querySelectorAll( '.woocommerce-product-gallery__wrapper .lpl-label' )
		.forEach( ( label ) => {
			const gallery = label.closest( '.woocommerce-product-gallery' );
			if ( gallery ) {
				gallery.appendChild( label );
			}
		} );
} );
