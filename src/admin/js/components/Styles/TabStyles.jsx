import { __ } from '@wordpress/i18n';
import { Card, BlockStack, Text } from '@shopify/polaris';

const TabStyles = () => {
	return (
		<Card>
			<BlockStack gap="300">
				<Text as="h3" variant="headingMd">
					{ __( 'Label Styles', 'lime-product-labels' ) }
				</Text>
				<Text as="p" variant="bodyMd" tone="subdued">
					{ __( 'Style configuration options will be available in a future update.', 'lime-product-labels' ) }
				</Text>
			</BlockStack>
		</Card>
	);
};

export default TabStyles;
