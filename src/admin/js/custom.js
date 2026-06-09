import domReady from '@wordpress/dom-ready';
import { getCurrentTab, setActiveWPMenu } from '@coreJS/helpers';

domReady( () => {
	setActiveWPMenu( getCurrentTab() );
} );
