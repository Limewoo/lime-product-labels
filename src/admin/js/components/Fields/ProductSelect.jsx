import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import useSelectField from '@admin/hooks/useSelectField';
import { fetchProducts } from '@coreJS/api';

import {
	Icon,
	ResourceItem,
	ResourceList,
	SkeletonThumbnail,
	Spinner,
	Text,
	TextField,
	Thumbnail,
} from '@shopify/polaris';
import { SearchIcon, XCircleIcon } from '@shopify/polaris-icons';
import SelectModal from './SelectModal';

const productCache = {};

const ProductSelect = ( props ) => {
	const {
		fieldId,
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
		fetchFunction: fetchProducts,
		cache: productCache,
		dataSource: 'product',
		multiple,
		idField: 'id',
		displayField: 'name',
	} );

	const columns = [
		{
			header: '',
			width: '50px',
			cell: ( item ) =>
				item.thumbnail_url ? (
					<Thumbnail source={ item.thumbnail_url } alt={ item.name } size="small" />
				) : (
					<SkeletonThumbnail size="small" />
				),
		},
		{
			header: __( 'Product', 'lime-product-labels' ),
			cell: ( item ) => item.parent_id ? `  — ${ item.name }` : item.name,
		},
		{
			header: __( 'Price', 'lime-product-labels' ),
			cell: ( item ) => <div dangerouslySetInnerHTML={ { __html: item.price_html } } />,
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
				title={ __( 'Select Products', 'lime-product-labels' ) }
				placeholder={ __( 'Search for products', 'lime-product-labels' ) }
				options={ filteredOptions }
				selectedItems={ selected }
				multiple={ multiple }
				isLoading={ isLoading }
				searchTerm={ searchTerm }
				setSearchTerm={ setSearchTerm }
				columns={ columns }
				context="product"
			/>

			{ selected.length > 0 ? (
				<div style={ { marginTop: '.25rem' } }>
					<ResourceList
						resourceName={ { singular: 'product', plural: 'products' } }
						items={ selected }
						renderItem={ ( item ) => {
							const { id, name, price_html, thumbnail_url: thumbnailUrl } = item;
							return (
								<ResourceItem
									id={ id }
									accessibilityLabel={ `View ${ name }` }
									verticalAlignment="center"
									media={
										thumbnailUrl ? (
											<Thumbnail source={ thumbnailUrl } alt={ name } size="small" />
										) : (
											<SkeletonThumbnail size="small" />
										)
									}
									persistActions
									shortcutActions={ [
										{
											icon: XCircleIcon,
											accessibilityLabel: __( 'Remove', 'lime-product-labels' ),
											onAction: () => handleRemove( id ),
										},
									] }
								>
									<Text variant="bodyMd" fontWeight="bold" as="h3">{ name }</Text>
									{ price_html && <div dangerouslySetInnerHTML={ { __html: price_html } } /> }
								</ResourceItem>
							);
						} }
					/>
				</div>
			) : (
				!! value.length && (
					<Spinner accessibilityLabel={ __( 'Loading', 'lime-product-labels' ) } size="small" />
				)
			) }
		</>
	);
};

export default ProductSelect;
