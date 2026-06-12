import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	__experimentalUnitControl as UnitControl,
	RangeControl,
} from '@wordpress/components';
import { BlockStack, InlineStack, Text, Labelled } from '@shopify/polaris';

const allowedUnits = [
	{ label: 'px', value: 'px' },
	{ label: 'em', value: 'em' },
	{ label: 'rem', value: 'rem' },
	{ label: '%', value: '%' },
	{ label: 'vw', value: 'vw' },
	{ label: 'vh', value: 'vh' },
];

const AUTO_UNIT = { label: __( 'Auto', 'lime-product-labels' ), value: '' };

const UnitSelect = ( props ) => {
	const {
		fieldId,
		fieldType,
		fieldLabel,
		labelHidden,
		helpText = '',
		slider = false,
		clearable = false,
		value,
		onChange,
		units = allowedUnits,
		min = 0,
		max = 999,
		step = 0.01,
	} = props;

	const effectiveUnits = clearable ? [ AUTO_UNIT, ...units ] : units;

	const [ currentUnit, setCurrentUnit ] = useState( 'px' );
	const [ numericValue, setNumericValue ] = useState( 0 );

	const isAuto = clearable && ( value === '' || value === undefined || value === null );

	useEffect( () => {
		if ( value ) {
			const num = parseFloat( value );
			const unitMatch = value.match( /[a-zA-Z%]+$/ );
			setNumericValue( ! isNaN( num ) ? num : 0 );
			if ( unitMatch ) {
				setCurrentUnit( unitMatch[ 0 ] );
			}
		} else if ( clearable ) {
			setCurrentUnit( '' );
			setNumericValue( 0 );
		}
	}, [ value ] );

	const handleSliderChange = ( val ) => {
		const unit = isAuto ? 'px' : currentUnit;
		if ( isAuto ) setCurrentUnit( 'px' );
		setNumericValue( val );
		onChange( `${ val }${ unit }` );
	};

	const handleUnitChange = ( unit ) => {
		setCurrentUnit( unit );
		if ( unit === '' && clearable ) {
			setNumericValue( 0 );
			onChange( '' );
		} else {
			onChange( `${ numericValue }${ unit }` );
		}
	};

	return (
		<BlockStack gap="0">
			{ ( fieldLabel && ! labelHidden ) && <Labelled label={ fieldLabel } id={ fieldId } /> }
			<div className={ `lime-product-labels__field--${ fieldType }--${ slider ? 'has-slider' : 'no-slider' }` }>
				<InlineStack gap="400" wrap={ false } blockAlign="center">
					{ !! slider && (
						<div style={ { width: '100%' } }>
							<RangeControl
								railColor="linear-gradient(to right, #e3e3e3, #e3e3e3 50%, transparent 50%, transparent 100%)"
								trackColor="#1a1a1a"
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								min={ min }
								max={ max }
								step={ step }
								value={ isAuto ? min : numericValue }
								onChange={ handleSliderChange }
								withInputField={ false }
							/>
						</div>
					) }

					<div style={ { width: slider ? '85px' : '100%' } }>
						<UnitControl
							min={ min }
							max={ max }
							step={ step }
							__next40pxDefaultSize
							value={ isAuto ? '' : value }
							units={ effectiveUnits }
							onChange={ isAuto ? ( val ) => {
								const num = parseFloat( val ) || 0;
								setCurrentUnit( 'px' );
								setNumericValue( num );
								onChange( `${ num }px` );
							} : onChange }
							onUnitChange={ handleUnitChange }
						/>
					</div>
				</InlineStack>
				{ helpText && <Text as="span" variant="bodySm" tone="subdued">{ helpText }</Text> }
			</div>
		</BlockStack>
	);
};

export default UnitSelect;
