import { __ } from '@wordpress/i18n';
import { BlockStack, Text } from '@shopify/polaris';

import TextShapeBadge from '@adminImages/shapes/text-shape-badge.svg';
import TextShapeTag from '@adminImages/shapes/text-shape-tag.svg';
import TextShapeChevron from '@adminImages/shapes/text-shape-chevron.svg';
import TextShapeCircle from '@adminImages/shapes/text-shape-circle.svg';
import TextShapeBanner from '@adminImages/shapes/text-shape-banner.svg';
import TextShapeCorner from '@adminImages/shapes/text-shape-corner.svg';
import TextShapeBurst from '@adminImages/shapes/text-shape-burst.svg';
import TextShapeShield from '@adminImages/shapes/text-shape-shield.svg';

const TEXT_SHAPES = [
	{ value: 'text-shape-badge',   component: TextShapeBadge },
	{ value: 'text-shape-tag',     component: TextShapeTag },
	{ value: 'text-shape-chevron', component: TextShapeChevron },
	{ value: 'text-shape-circle',  component: TextShapeCircle },
	{ value: 'text-shape-banner',  component: TextShapeBanner },
	{ value: 'text-shape-corner',  component: TextShapeCorner },
	{ value: 'text-shape-burst',   component: TextShapeBurst },
	{ value: 'text-shape-shield',  component: TextShapeShield },
];

const SHAPE_SETS = {
	text: TEXT_SHAPES,
};

const ShapeSelect = ( {
	fieldLabel = '',
	labelHidden = false,
	value = 'text-shape-1',
	onChange = () => {},
	attributes = {},
} ) => {
	const shapeType = attributes?.shape_type || 'text';
	const shapes = SHAPE_SETS[ shapeType ] || TEXT_SHAPES;

	return (
		<BlockStack gap="300">
			{ ( fieldLabel && ! labelHidden ) && (
				<Text as="p" variant="bodyMd">{ fieldLabel }</Text>
			) }
			<div className="lime-product-labels__shape-select">
				{ shapes.map( ( { value: shapeValue, component: ShapeSVG } ) => {
					const isSelected = value === shapeValue;
					return (
						<button
							key={ shapeValue }
							type="button"
							className={ `lime-product-labels__shape-item${ isSelected ? ' is-selected' : '' }` }
							onClick={ () => onChange( shapeValue ) }
							aria-label={ shapeValue }
							aria-pressed={ isSelected }
						>
							<ShapeSVG />
						</button>
					);
				} ) }
			</div>
		</BlockStack>
	);
};

export default ShapeSelect;
