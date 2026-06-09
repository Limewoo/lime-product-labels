import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { fetchUsers } from '@coreJS/api';
import useSelectField from '@admin/hooks/useSelectField';
import SelectModal from './SelectModal';

import { Icon, Tag, InlineStack, Spinner, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

const userCache = {};

const UserSelect = ( props ) => {
	const {
		fieldLabel = '',
		labelHidden = false,
		value = [],
		onChange = () => {},
		placeholder = '',
		helpText = '',
		multiple = true,
	} = props;

	const [ isModalOpen, setIsModalOpen ] = useState( false );

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
		fetchFunction: fetchUsers,
		cache: userCache,
		dataSource: 'user',
		multiple,
		idField: 'id',
		displayField: 'name',
	} );

	const columns = [
		{
			header: __( 'Users', 'lime-product-labels' ),
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
				title={ __( 'Select users', 'lime-product-labels' ) }
				placeholder={ __( 'Search for users', 'lime-product-labels' ) }
				options={ filteredOptions }
				selectedItems={ selected }
				multiple={ multiple }
				isLoading={ isLoading }
				searchTerm={ searchTerm }
				setSearchTerm={ setSearchTerm }
				columns={ columns }
				context="user"
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
					<Spinner
						accessibilityLabel={ __( 'Loading', 'lime-product-labels' ) }
						size="small"
					/>
				)
			) }
		</>
	);
};

export default UserSelect;
