import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@coreJS/contexts/AppContext';
import { AppProvider as PolarisProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import queryClient from '@coreJS/queryClient';

const renderApp = ( Component, mode = 'admin', containerId = 'lime-product-labels-root' ) => {
	domReady( () => {
		const rootElement = document.getElementById( containerId );

		if ( rootElement ) {
			const root = createRoot( rootElement );

			root.render(
				<QueryClientProvider client={ queryClient }>
					<AppProvider mode={ mode }>
						{ mode === 'admin' ? (
							<PolarisProvider i18n={ enTranslations }>
								<Component />
							</PolarisProvider>
						) : (
							<Component />
						) }
					</AppProvider>
				</QueryClientProvider>
			);
		}
	} );
};

export default renderApp;
