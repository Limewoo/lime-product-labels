import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import {
	Text,
	Icon,
	TextField,
	DataTable,
	Card,
	Checkbox,
	BlockStack,
	ButtonGroup,
	Button,
	Spinner,
	InlineStack,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useState } from '@wordpress/element';

const SelectModal = ( props ) => {
	const {
		isOpen,
		onSelect,
		onCancel,
		onClose,
		title,
		options = [],
		selectedItems = [],
		multiple = true,
		isLoading,
		searchTerm,
		setSearchTerm,
		columns = [],
		idField = 'id',
		placeholder,
		context,
	} = props;

	if ( ! isOpen ) {
		return null;
	}

	const [ isSelected, setIsSelected ] = useState( false );

	const handleSelectItem = ( itemId ) => {
		setIsSelected( true );
		onSelect( itemId );
		if ( ! multiple ) {
			onClose();
		}
	};

	const headings = multiple
		? [ '', ...columns.map( ( col ) => col.header ) ]
		: columns.map( ( col ) => col.header );

	const rows = options.map( ( option ) => {
		const selected = selectedItems.some( ( s ) => s[ idField ] === option[ idField ] );

		const rowCells = columns.map( ( col ) => (
			<div
				role="button"
				tabIndex={ 0 }
				style={ { cursor: 'pointer' } }
				onClick={ () => handleSelectItem( option[ idField ] ) }
			>
				{ col.cell( option ) }
			</div>
		) );

		if ( multiple ) {
			const checkbox = (
				<Checkbox
					label={ `Select ${ option.name || option.id }` }
					labelHidden
					checked={ selected }
					onChange={ () => handleSelectItem( option[ idField ] ) }
				/>
			);
			return [ checkbox, ...rowCells ];
		}

		return rowCells;
	} );

	const columnContentTypes = [
		'text',
		...columns.map( () => 'text' ),
	];

	return (
		<Modal
			className="lime-product-labels__modal lime-product-labels__modal-items-select"
			title={ title }
			onRequestClose={ onClose }
			shouldCloseOnEsc
			shouldCloseOnClickOutside
			size="large"
			style={ { maxWidth: context === 'product' ? '840px' : '640px' } }
		>
			<BlockStack gap="500">
				<div className="lime-product-labels__field">
					<TextField
						label={ __( 'Search', 'lime-product-labels' ) }
						labelHidden={ true }
						value={ searchTerm }
						onChange={ setSearchTerm }
						placeholder={ placeholder || __( 'Search for items…', 'lime-product-labels' ) }
						prefix={ <Icon source={ SearchIcon } /> }
						autoComplete="on"
						autoFocus
						clearButton={ true }
						onClearButtonClick={ () => setSearchTerm( '' ) }
					/>
				</div>

				{ isLoading ? (
					<InlineStack align="center">
						<Spinner accessibilityLabel={ __( 'Loading', 'lime-product-labels' ) } size="small" />
					</InlineStack>
				) : ! options.length ? (
					<Text as="div" alignment="center">{ __( 'No results found.', 'lime-product-labels' ) }</Text>
				) : (
					<BlockStack gap="400">
						<Card padding="0">
							<div
								className={ `lime-product-labels__table lime-product-labels__table-${ context }${ multiple ? ' is-multi-select' : '' }` }
								style={ { maxHeight: '400px', overflowY: 'auto' } }>
								<DataTable
									hoverable={ true }
									verticalAlign="middle"
									columnContentTypes={ columnContentTypes }
									headings={ headings }
									rows={ rows }
								/>
							</div>
						</Card>
						{ multiple && (
							<InlineStack align="end">
								<ButtonGroup>
									<Button onClick={ () => { isSelected ? onCancel() : onClose(); } }>
										{ __( 'Cancel', 'lime-product-labels' ) }
									</Button>
									<Button variant="primary" onClick={ onClose }>
										{ __( 'Done', 'lime-product-labels' ) }
									</Button>
								</ButtonGroup>
							</InlineStack>
						) }
					</BlockStack>
				) }
			</BlockStack>
		</Modal>
	);
};

export default SelectModal;
