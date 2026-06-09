import { __ } from '@wordpress/i18n';
import { Card, BlockStack, InlineStack, Text } from '@shopify/polaris';

const EmptyLabels = () => {
	return (
		<div className="lime-product-labels__list-empty">
			<Card padding="600">
				<InlineStack blockAlign="center" align="space-between" gap="600">
					<InlineStack blockAlign="center" gap="600">
						<img
							alt={ __( 'Create your first product label.', 'lime-product-labels' ) }
							width="118px"
							height="136px"
							style={ {
								objectFit: 'cover',
								objectPosition: 'center',
							} }
							src="/wp-content/plugins/lime-product-labels/build/images/empty-label.svg"
						/>
						<BlockStack gap="200">
							<Text as="h3" variant="headingLg" fontWeight="medium">
								{ __( 'Create your first product label.', 'lime-product-labels' ) }
							</Text>
							<Text as="div" variant="bodyLg" tone="subdued">
								{ __( 'Add visual badge labels to your product images to highlight special items.', 'lime-product-labels' ) }
							</Text>
						</BlockStack>
					</InlineStack>
				</InlineStack>
			</Card>
		</div>
	);
};

export default EmptyLabels;
