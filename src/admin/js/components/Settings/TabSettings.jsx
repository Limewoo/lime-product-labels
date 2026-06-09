import { __ } from '@wordpress/i18n';
import { Card, BlockStack, Text } from '@shopify/polaris';

const TabSettings = () => {
	return (
		<Card>
			<BlockStack gap="300">
				<Text as="h3" variant="headingMd">
					{ __( 'Global Settings', 'lime-product-labels' ) }
				</Text>
				<Text as="p" variant="bodyMd" tone="subdued">
					{ __( 'Plugin settings will be available in a future update.', 'lime-product-labels' ) }
				</Text>
			</BlockStack>
		</Card>
	);
};

export default TabSettings;
