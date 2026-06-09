import { __ } from '@wordpress/i18n';
import { Box, BlockStack, SkeletonDisplayText, SkeletonBodyText, SkeletonThumbnail } from '@shopify/polaris';

const Widget = ( { formData = {} } ) => {
	const labelName = formData?.name || __( 'Label', 'lime-product-labels' );

	return (
		<div className="lime-product-labels__preview-widget">
			<Box borderWidth="200" borderColor="#1A1A1A" borderRadius="500" padding="500" paddingBlockEnd="100" shadow="400">
				<BlockStack gap="800">
					<div className="flex flex-col gap-ml lime-product-labels__preview-header">
						<div className="flex items-end gap-ml">
							<div className="position-relative">
								<SkeletonThumbnail size="large" />
								{ labelName && (
									<span className="lime-product-labels__preview-badge">
										{ labelName }
									</span>
								) }
							</div>
							<div className="flex-grow flex flex-col gap-md">
								<SkeletonBodyText />
								<svg viewBox="0.5 0.5 336 41" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect x="0.5" y="0.5" width="336" height="41" fill="#DADADA"></rect>
									<rect x="0.5" y="0.5" width="336" height="41" stroke="#DADADA"></rect>
									<rect x="107" y="18.5" width="123" height="5" rx="2.5" fill="white"></rect>
								</svg>
							</div>
						</div>
						<SkeletonBodyText />
						<SkeletonDisplayText size="large" />
						<SkeletonBodyText />
					</div>

					<div className="flex flex-col gap-lg lime-product-labels__preview-footer">
						<div>
							<svg viewBox="0 -1 335 120" fill="none" xmlns="http://www.w3.org/2000/svg">
								<mask id="path-1-inside-1_lpl_2268" fill="white"><path d="M0 0H335V151H0V0Z"></path></mask>
								<rect y="22.5" width="93" height="11" rx="5.5" fill="#DADADA"></rect>
								<rect y="56" width="335" height="5" rx="2.5" fill="#DADADA"></rect>
								<rect y="85" width="335" height="5" rx="2.5" fill="#DADADA"></rect>
								<rect y="114" width="230" height="5" rx="2.5" fill="#DADADA"></rect>
							</svg>
						</div>
						<div>
							<svg viewBox="0 -1 335 34.5" fill="none" xmlns="http://www.w3.org/2000/svg">
								<mask id="path-1-inside-1_lpl_2278" fill="white"><path d="M0 0H335V56H0V0Z"></path></mask>
								<path d="M0 0V1H335V0V-1H0V0Z" fill="#0D0C0C" fillOpacity="0.15" mask="url(#path-1-inside-1_lpl_2278)"></path>
								<rect y="22.5" width="70" height="11" rx="5.5" fill="#DADADA"></rect>
							</svg>
						</div>
					</div>
				</BlockStack>
			</Box>
		</div>
	);
};

export default Widget;
