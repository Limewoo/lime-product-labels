import { useEffect, useState } from '@wordpress/element';
import _ from 'lodash';
import { decodeEntities } from '@wordpress/html-entities';
import { evaluateConditions } from '@coreJS/helpers';
import {
	Box,
	Card,
	Checkbox,
	ChoiceList,
	Select,
	TextField,
	BlockStack,
	RadioButton,
	Label,
	InlineStack,
	InlineGrid,
	Button,
	Icon,
	Text,
} from '@shopify/polaris';
import { PlusIcon, MinusIcon } from '@shopify/polaris-icons';
import ProductSelect from './ProductSelect';
import TaxonomySelect from './TaxonomySelect';
import UserSelect from './UserSelect';
import UserRoleSelect from './UserRoleSelect';
import ShapeSelect from './ShapeSelect';
import ColorSelect from './ColorSelect';
import UnitSelect from './UnitSelect';
import ButtonField from './ButtonField';

const RenderFields = ( props ) => {
	const {
		title = '',
		description = '',
		titleFont = 'medium',
		headingPadding = '500',
		section = {},
		icon = null,
		flexDirection = 'column',
		fields = [],
		fieldOverrides = {},
		groupFields = false,
		formData = {},
		handleChange = () => {},
		handleButtonClick = () => {},
		open = true,
		disableAccordion = false,
	} = props;

	const [ isOpen, setIsOpen ] = useState( open );

	const toggleAccordion = () => {
		if ( disableAccordion ) return;
		setIsOpen( ( prev ) => ! prev );
	};

	useEffect( () => {
		setIsOpen( open );
	}, [ open ] );

	const renderedFields = fields.map( ( field ) => {
		const {
			id: fieldId,
			type: fieldType,
			label: rawLabel,
			label_hidden: labelHidden = false,
			placeholder,
			desc: rawDesc = '',
			attributes = {},
			options: rawOptions = {},
			multiple = false,
			conditions = null,
			prefix: rawPrefix = null,
			suffix: rawSuffix = null,
			col = 'full',
			classes = '',
			stacked = false,
		} = field;

		const fieldLabel = decodeEntities( rawLabel );
		const desc       = decodeEntities( rawDesc );
		const prefix     = rawPrefix ? decodeEntities( rawPrefix ) : null;
		const suffix     = rawSuffix ? decodeEntities( rawSuffix ) : null;

		if ( conditions && ! evaluateConditions( conditions, formData ) ) return null;
		if ( ! fieldId || ! fieldType ) return null;

		const override = fieldOverrides[ fieldId ];
		const value    = override?.value ?? formData[ fieldId ] ?? field.default ?? '';
		const onChange = override?.onChange ?? ( ( val ) => handleChange( val, fieldId, field ) );
		const onClear  = override?.onClear ?? ( () => onChange( '' ) );

		const { data_source: dataSource, min, max, step } = attributes;

		const options = Array.isArray( rawOptions )
			? rawOptions.map( ( item ) => ( {
				value:    item.value,
				label:    decodeEntities( item.label ),
				disabled: item?.disabled || false,
			} ) )
			: _.map( rawOptions, ( labelText, optionValue ) => ( {
				value: optionValue,
				label: decodeEntities( labelText ),
			} ) );

		let fieldComponent = null;

		const fieldProps = {
			...field,
			...attributes,
			fieldType,
			fieldId,
			fieldLabel,
			labelHidden,
			helpText: desc,
			placeholder,
			onChange,
			onClear,
			value,
		};

		switch ( fieldType ) {
			case 'note': {
				const labelTone   = field[ 'label_tone' ] || 'base';
				const descTone    = field[ 'desc_tone' ]  || 'subdued';
				const spacingTop    = field[ 'spacing_top' ] || 0;
				const spacingBottom = field[ 'spacing_bottom' ] || 0;
				fieldComponent = (
					<div style={ { marginTop: spacingTop, marginBottom: spacingBottom } }>
						<BlockStack gap="150">
							{ !! fieldLabel && <Text as="h4" tone={ labelTone } variant="bodyMd">{ fieldLabel }</Text> }
							{ !! desc && <Text as="span" tone={ descTone } variant="bodySm">{ desc }</Text> }
						</BlockStack>
					</div>
				);
				break;
			}

			case 'text':
			case 'textarea': {
				const multiline = fieldType === 'textarea' ? 4 : false;
				fieldComponent = (
					<TextField
						multiline={ multiline }
						type="text"
						size="large"
						label={ fieldLabel }
						labelHidden={ labelHidden }
						helpText={ desc }
						prefix={ decodeEntities( prefix ) }
						suffix={ decodeEntities( suffix ) }
						value={ decodeEntities( value ) }
						onChange={ onChange }
						autoComplete="on"
						clearButton
						onClearButtonClick={ onClear }
					/>
				);
				break;
			}

			case 'number':
				fieldComponent = (
					<TextField
						type="number"
						size="large"
						label={ fieldLabel }
						labelHidden={ labelHidden }
						helpText={ desc }
						prefix={ decodeEntities( prefix ) }
						suffix={ decodeEntities( suffix ) }
						value={ value }
						onChange={ onChange }
						autoComplete="on"
						min={ min }
						max={ max }
						step={ step }
						clearButton
						onClearButtonClick={ onClear }
					/>
				);
				break;

			case 'select':
				fieldProps.multiple = multiple;
				if ( dataSource === 'products' ) {
					fieldComponent = <ProductSelect { ...fieldProps } />;
				} else if ( [ 'categories', 'tags', 'brands' ].includes( dataSource ) ) {
					fieldComponent = <TaxonomySelect { ...fieldProps } taxonomy={ dataSource } />;
				} else if ( dataSource === 'users' ) {
					fieldComponent = <UserSelect { ...fieldProps } />;
				} else if ( dataSource === 'user_roles' ) {
					fieldComponent = <UserRoleSelect { ...fieldProps } />;
				} else {
					fieldComponent = <Select options={ options } { ...fieldProps } />;
				}
				break;

			case 'checkbox':
				fieldComponent = multiple ? (
					<ChoiceList
						allowMultiple
						title={ fieldLabel }
						titleHidden={ labelHidden }
						choices={ options }
						selected={ value }
						onChange={ onChange }
					/>
				) : (
					<Checkbox
						label={ fieldLabel }
						labelHidden={ labelHidden }
						helpText={ desc }
						checked={ value }
						onChange={ onChange }
					/>
				);
				break;

			case 'radio': {
				const radioButtons = options.map( ( option ) => (
					<RadioButton
						key={ option.value }
						label={ option.label }
						checked={ value === option.value }
						id={ `${ fieldId }_${ option.value }` }
						name={ fieldId }
						disabled={ option.disabled }
						onChange={ () => handleChange( option.value, fieldId, field ) }
					/>
				) );
				fieldComponent = (
					<BlockStack gap="200">
						{ ( fieldLabel && ! labelHidden ) && <Label id={ fieldId }>{ fieldLabel }</Label> }
						{ stacked
							? <BlockStack gap="200">{ radioButtons }</BlockStack>
							: <InlineStack gap="500">{ radioButtons }</InlineStack>
						}
						{ desc && <Text as="span" variant="bodySm" tone="subdued">{ desc }</Text> }
					</BlockStack>
				);
				break;
			}

			case 'button':
				fieldComponent = (
					<ButtonField
						{ ...fieldProps }
						handleButtonClick={ handleButtonClick }
					/>
				);
				break;

			case 'color':
				fieldComponent = <ColorSelect { ...fieldProps } />;
				break;

			case 'unit':
				fieldComponent = <UnitSelect { ...fieldProps } />;
				break;

			case 'shape-select':
				fieldComponent = (
					<ShapeSelect
						fieldLabel={ fieldLabel }
						labelHidden={ labelHidden }
						value={ value }
						onChange={ onChange }
						attributes={ attributes }
					/>
				);
				break;

			case 'hidden':
				return (
					<input type="hidden" name={ fieldId } value={ value } key={ fieldId } />
				);

			default:
				return null;
		}

		let fieldClasses = 'flex flex-col lime-product-labels__field';
		fieldClasses += ` lime-product-labels__field--${ fieldType } lime-product-labels__field--${ fieldId } col-${ col }`;
		fieldClasses += stacked ? ' lime-product-labels__field--stacked' : '';
		fieldClasses += classes ? ` ${ classes }` : '';

		return (
			<div key={ fieldId } className={ fieldClasses }>
				{ fieldComponent }
			</div>
		);
	} );

	const isColumn = flexDirection === 'column';
	const stackProps = isColumn
		? { columns: 1 }
		: { columns: [ 'oneThird', 'twoThirds' ], gap: 500 };

	return (
		<Card roundedAbove="xs" padding="0" background={ isColumn ? 'bg-surface' : 'bg-fill-transparent' }>
			<InlineGrid { ...stackProps }>
				{ ( title || description || icon ) && (
					<div
						className={ `position-relative lime-product-labels__section-header${ ! disableAccordion ? ' lime-product-labels__section-header--has-accordion' : '' }` }
						onClick={ toggleAccordion }
					>
						<Box padding={ headingPadding }>
							<InlineStack align="space-between" blockAlign="center">
								<BlockStack gap="200">
									{ !! title && <Text as="h4" variant="bodyLg" fontWeight={ titleFont }>{ decodeEntities( title ) }</Text> }
									{ description && isOpen && <Text as="span" variant="bodySm">{ decodeEntities( description ) }</Text> }
								</BlockStack>
								<div className="position-absolute lime-product-labels__section-icon">
									{ icon }
									{ ! disableAccordion && (
										<Button
											variant="plain"
											icon={ <Icon source={ isOpen ? MinusIcon : PlusIcon } /> }
										/>
									) }
								</div>
							</InlineStack>
						</Box>
					</div>
				) }

				{ isOpen && (
					<div className={ `lime-product-labels__fields${ groupFields ? ' lime-product-labels__fields--group' : '' }` }>
						<Box padding={ ! groupFields ? 500 : 100 } background="bg-surface">
							<BlockStack gap="400">
								{ renderedFields }
							</BlockStack>
						</Box>
					</div>
				) }
			</InlineGrid>
		</Card>
	);
};

export default React.memo( RenderFields, ( prevProps, nextProps ) => {
	return (
		_.isEqual( prevProps.fields, nextProps.fields ) &&
		_.isEqual( prevProps.formData, nextProps.formData ) &&
		prevProps.title === nextProps.title &&
		prevProps.description === nextProps.description &&
		_.isEqual( prevProps.fieldOverrides, nextProps.fieldOverrides )
	);
} );
