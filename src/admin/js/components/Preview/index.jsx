import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Box, Card, InlineStack, Text } from '@shopify/polaris';
import Widget from './Widget';

const Preview = ( { formData = {} } ) => {
	const [ isSticky, setIsSticky ] = useState( false );
	const previewRef = useRef( null );
	const originalTopRef = useRef( null );
	const originalWidthRef = useRef( null );

	const wpAdminBarHeight = document.querySelector( '#wpadminbar' )?.clientHeight || 0;

	useEffect( () => {
		if ( previewRef.current && originalTopRef.current === null ) {
			const rect = previewRef.current.getBoundingClientRect();
			originalTopRef.current = rect.top + window.scrollY;
			originalWidthRef.current = rect.width;
		}

		const handleScroll = () => {
			if ( ! previewRef.current || originalTopRef.current === null ) {
				return;
			}
			const scrollTop = window.scrollY;
			if ( scrollTop >= originalTopRef.current - wpAdminBarHeight ) {
				setIsSticky( true );
			} else {
				setIsSticky( false );
			}
		};

		handleScroll();
		window.addEventListener( 'scroll', handleScroll );
		return () => window.removeEventListener( 'scroll', handleScroll );
	}, [] );

	const stickyStyle = isSticky && originalWidthRef.current
		? {
			position: 'fixed',
			top: wpAdminBarHeight,
			width: `${ originalWidthRef.current }px`,
		}
		: {};

	return (
		<div
			className={ `lime-product-labels__preview-wrapper ${ isSticky ? 'is-sticky' : '' }` }
			ref={ previewRef }
			style={ stickyStyle }
		>
			<Card roundedAbove="xs" padding="0">
				<div className="lime-product-labels__preview">
					<div className="lime-product-labels__section-header">
						<Box padding="500">
							<InlineStack align="space-between" blockAlign="center">
								<Text as="h4" variant="bodyLg" fontWeight="medium">{ __( 'Preview', 'lime-product-labels' ) }</Text>
							</InlineStack>
						</Box>
					</div>
					<Box padding="200">
						<Widget formData={ formData } />
					</Box>
				</div>
			</Card>
		</div>
	);
};

export default Preview;
