import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { fetchTaxonomies } from '@coreJS/api';
import useSelectField from '@admin/hooks/useSelectField';

import {
	Icon,
	Tag,
	InlineStack,
	Spinner,
	TextField,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import SelectModal from './SelectModal';

const taxonomyCache = {
	categories: {},
	tags: {},
	brands: {},
};

const TaxonomySelect = ( props ) => {
	const {
		taxonomy,
		fieldLabel = '',
		labelHidden = false,
		value = [],
		onChange = () => {},
		placeholder = '',
		helpText = '',
		multiple = true,
	} = props;

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	if ( ! taxonomy ) {
		console.warn( 'TaxonomySelect: taxonomy prop is required.' );
		return null;
	}

	if ( ! taxonomyCache[ taxonomy ] ) {
		taxonomyCache[ taxonomy ] = {};
	}

	const {
		selected,
		setSelected,
		searchTerm,
		setSearchTerm,
		isLoading,
		filteredOptions,
		handleSelect,
		handleRemove,
	} = useSelectField( {
		value,
		onChange,
		fetchFunction: fetchTaxonomies,
		cache: taxonomyCache[ taxonomy ],
		dataSource: 'term',
		multiple,
		idField: 'id',
		displayField: 'name',
		fetchParams: { taxonomy },
	} );

	const columns = [
		{
			header: taxonomy,
			cell: ( item ) => item.name,
		},
	];

	return (
		<>
			<TextField
				label={ fieldLabel }
				labelHidden={ labelHidden }
				helpText={ helpText }
				value=""
				onChange={ setSearchTerm }
				placeholder={ placeholder }
				prefix={ <Icon source={ SearchIcon } /> }
				autoComplete="off"
				onFocus={ () => setIsModalOpen( true ) }
			/>
			<SelectModal
				idField="id"
				isOpen={ isModalOpen }
				onSelect={ handleSelect }
				onCancel={ () => {
					setSelected( [] );
					setIsModalOpen( false );
				} }
				onClose={ () => setIsModalOpen( false ) }
				title={ `Select ${ taxonomy }` }
				placeholder={ `Search for ${ taxonomy }` }
				options={ filteredOptions }
				selectedItems={ selected }
				multiple={ multiple }
				isLoading={ isLoading }
				searchTerm={ searchTerm }
				setSearchTerm={ setSearchTerm }
				columns={ columns }
				context="taxonomy"
			/>

			{ selected.length > 0 ? (
				<div style={ { marginTop: '.25rem' } }>
					<InlineStack gap="200">
						{ selected.map( ( option ) => (
							<Tag
								key={ option.id }
								onRemove={ () => handleRemove( option.id ) }
							>
								{ option.name }
							</Tag>
						) ) }
					</InlineStack>
				</div>
			) : (
				!! value.length && (
					<Spinner accessibilityLabel={ __( 'Loading', 'lime-product-labels' ) } size="small" />
				)
			) }
		</>
	);
};

export default TaxonomySelect;
