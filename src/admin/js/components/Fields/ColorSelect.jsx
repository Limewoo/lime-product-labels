import { ColorPicker } from '@wordpress/components';
import { Card, TextField } from '@shopify/polaris';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';

const ColorSelect = ( props ) => {
	const [ open, setOpen ] = useState( false );
	const pickerRef = useRef( null );
	const fieldRef = useRef( null );

	const {
		fieldId,
		fieldType,
		fieldLabel,
		labelHidden,
		helpText,
		value,
		onChange = () => {},
		field,
		default: defaultColor = '',
		is_bottom: isBottomField = false,
	} = props;

	const handleToggle = useCallback(
		() => setOpen( ( prev ) => ! prev ), []
	);

	useEffect( () => {
		if ( ! open ) {
			return;
		}

		const handleClickOutside = ( event ) => {
			if (
				pickerRef.current && ! pickerRef.current.contains( event.target ) &&
				fieldRef.current && ! fieldRef.current.contains( event.target )
			) {
				setOpen( false );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ open ] );

	const classNamePrefix = `lime-product-labels__field--${ fieldType }`;

	const getColorPreview = () => (
		<span
			className={ `${ classNamePrefix }-preview` }
			style={ { backgroundColor: value || field?.default } }
			onClick={ handleToggle }
		/>
	);

	return (
		<div className={ classNamePrefix }>
			<div ref={ fieldRef }>
				<TextField
					type="text"
					size="large"
					label={ fieldLabel }
					labelHidden={ labelHidden }
					helpText={ helpText }
					prefix={ getColorPreview() }
					value={ decodeEntities( value ) }
					onChange={ onChange }
					autoComplete="off"
					clearButton
					onClearButtonClick={ () => {
						onChange( defaultColor, fieldId, field );
						setOpen( false );
					} }
				/>
			</div>

			{ !! open && (
				<div className="position-relative">
					<div
						ref={ pickerRef }
						className="position-absolute"
						style={ {
							left: 0,
							top: isBottomField ? 'auto' : '8px',
							bottom: isBottomField ? '50px' : 'auto',
							zIndex: 999,
							boxShadow: '0 8px 23px rgba(0, 0, 0, 0.13)',
						} }
					>
						<Card padding="200">
							<ColorPicker
								color={ value }
								onChange={ onChange }
								enableAlpha
								defaultValue={ defaultColor }
							/>
						</Card>
					</div>
				</div>
			) }
		</div>
	);
};

export default ColorSelect;
