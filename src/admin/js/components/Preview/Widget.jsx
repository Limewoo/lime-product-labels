import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Box, BlockStack, SkeletonBodyText, SkeletonDisplayText, SkeletonThumbnail } from '@shopify/polaris';
import useAppStore from '@coreJS/hooks/useAppStore';

import TextShapeBadge   from '@adminImages/shapes/text-shape-badge.svg';
import TextShapeTag     from '@adminImages/shapes/text-shape-tag.svg';
import TextShapeChevron from '@adminImages/shapes/text-shape-chevron.svg';
import TextShapeCircle  from '@adminImages/shapes/text-shape-circle.svg';
import TextShapeBanner  from '@adminImages/shapes/text-shape-banner.svg';
import TextShapeCorner  from '@adminImages/shapes/text-shape-corner.svg';
import TextShapeBurst   from '@adminImages/shapes/text-shape-burst.svg';
import TextShapeShield  from '@adminImages/shapes/text-shape-shield.svg';

const SHAPES = [
	{ value: 'text-shape-badge',   component: TextShapeBadge },
	{ value: 'text-shape-tag',     component: TextShapeTag },
	{ value: 'text-shape-chevron', component: TextShapeChevron },
	{ value: 'text-shape-circle',  component: TextShapeCircle },
	{ value: 'text-shape-banner',  component: TextShapeBanner },
	{ value: 'text-shape-corner',  component: TextShapeCorner },
	{ value: 'text-shape-burst',   component: TextShapeBurst },
	{ value: 'text-shape-shield',  component: TextShapeShield },
];

const SHAPE_MAP = {
	'text-shape-badge':   'badge',
	'text-shape-tag':     'tag',
	'text-shape-chevron': 'chevron',
	'text-shape-circle':  'circle',
	'text-shape-banner':  'banner',
	'text-shape-corner':  'corner',
	'text-shape-burst':   'burst',
	'text-shape-shield':  'shield',
};

const CSS_VAR_FIELDS = [
	'badge_bg',
	'badge_color',
	'badge_font_size',
	'badge_radius',
	'badge_width',
	'badge_height',
	'badge_padding_block',
	'badge_padding_inline',
	'badge_gap_horizontal',
	'badge_gap_vertical',
	'badge_image_width',
];

const PREVIEW_TOKENS = {
	'{sale_percent}':  '25%',
	'{sale_amount}':   '$5.00',
	'{stock_qty}':     '8',
	'{stock_status}':  'In Stock',
	'{regular_price}': '$20.00',
	'{sale_price}':    '$15.00',
	'{sku}':           'SKU-123',
};

const replaceTokensForPreview = ( text ) =>
	Object.entries( PREVIEW_TOKENS ).reduce(
		( acc, [ token, val ] ) => acc.split( token ).join( val ),
		text
	);

const Widget = ( { formData = {} } ) => {
	const { options } = useAppStore();

	const isStylesMode = 'style_method' in formData;

	const [ previewShape, setPreviewShape ] = useState( 'text-shape-badge' );

	const {
		name,
		label_type = 'text',
		label_image,
		label_shape = 'text-shape-badge',
		product_page_placement = 'top_left',
	} = isStylesMode ? {} : formData;

	const stylesData = isStylesMode ? formData : ( options?.styles || {} );
	const styleMethod = stylesData?.style_method || 'automatic';

	const labelName = replaceTokensForPreview( name || '' ) || __( 'Label', 'lime-product-labels' );
	const isImageLabel = ! isStylesMode && label_type === 'image';
	const imageUrl = label_image?.url || '';
	const activeShape = isStylesMode ? previewShape : label_shape;
	const shape = isImageLabel ? 'image' : ( SHAPE_MAP[ activeShape ] || 'badge' );
	const placementMod = ( product_page_placement || 'top_left' ).replace( '_', '-' );
	const badgeClasses = `lpl-label lpl-label--${ shape } lpl-label--${ placementMod }`;

	const inlineCssVars = useMemo( () => {
		if ( styleMethod !== 'manual' ) return {};
		return CSS_VAR_FIELDS.reduce( ( acc, fieldId ) => {
			const val = stylesData[ fieldId ];
			if ( val !== undefined && val !== '' ) {
				acc[ `--lpl-${ fieldId.replace( /_/g, '-' ) }` ] = val;
			}
			return acc;
		}, {} );
	}, [ styleMethod, stylesData ] );

	return (
		<div className="lime-product-labels__preview-widget" style={ inlineCssVars }>
			<Box borderWidth="200" borderColor="#1A1A1A" borderRadius="500" padding="500" paddingBlockEnd="100" shadow="400">
				<BlockStack gap="800">
					<div className="flex flex-col gap-ml lime-product-labels__preview-header">
						<div className="flex items-end gap-ml">
							<div className="position-relative">
								<SkeletonThumbnail size="large" />
								{ ( ! isImageLabel || imageUrl ) && (
									<div className={ badgeClasses }>
										{ isImageLabel ? (
											<img className="lpl-label__image" src={ imageUrl } alt={ labelName } />
										) : (
											<span className="lpl-label__text">{ labelName }</span>
										) }
									</div>
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

					{ isStylesMode && (
					<div className="lime-product-labels__preview-shape-picker">
						<div className="lime-product-labels__shape-select">
							{ SHAPES.map( ( { value: shapeValue, component: ShapeSVG } ) => (
								<button
									key={ shapeValue }
									type="button"
									className={ `lime-product-labels__shape-item${ previewShape === shapeValue ? ' is-selected' : '' }` }
									onClick={ () => setPreviewShape( shapeValue ) }
									aria-label={ shapeValue }
									aria-pressed={ previewShape === shapeValue }
								>
									<ShapeSVG />
								</button>
							) ) }
						</div>
					</div>
				) }

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
