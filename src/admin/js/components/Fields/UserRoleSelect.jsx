import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { fetchUserRoles } from '@coreJS/api';
import useSelectField from '@admin/hooks/useSelectField';
import SelectModal from './SelectModal';

import { Icon, Spinner, Tag, InlineStack, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

const userRoleCache = {};

const UserRoleSelect = ( props ) => {
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
		filteredOptions,
		isLoading,
		handleSelect,
		handleRemove,
	} = useSelectField( {
		value,
		onChange,
		fetchFunction: fetchUserRoles,
		cache: userRoleCache,
		dataSource: 'role_name',
		multiple,
		idField: 'id',
		displayField: 'name',
	} );

	const columns = [
		{
			header: __( 'User roles', 'lime-product-labels' ),
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
				title={ __( 'Select user roles', 'lime-product-labels' ) }
				placeholder={ __( 'Search for user roles', 'lime-product-labels' ) }
				options={ filteredOptions }
				selectedItems={ selected }
				multiple={ multiple }
				isLoading={ isLoading }
				searchTerm={ searchTerm }
				setSearchTerm={ setSearchTerm }
				columns={ columns }
				context="user-role"
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

export default UserRoleSelect;
