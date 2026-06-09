import {
	BlockStack,
	Button,
	DropZone,
	InlineStack,
	Icon,
	Text,
} from '@shopify/polaris';
import { XIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ButtonField = ( props ) => {
	const [ buttonStates, setButtonStates ] = useState( {
		file: null,
		loading: false,
		disabled: false,
	} );

	const {
		buttons = [],
		handleButtonClick = () => {},
	} = props;

	const formatFileSize = ( size ) => {
		if ( size < 1024 ) {
			return `${ size } B`;
		}
		if ( size < 1024 * 1024 ) {
			return `${ ( size / 1024 ).toFixed( 1 ) } KB`;
		}
		return `${ ( size / ( 1024 * 1024 ) ).toFixed( 1 ) } MB`;
	};

	const updateButtonStates = ( newState ) => {
		setButtonStates( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const handleDrop = useCallback( ( _dropFiles, acceptedFiles ) => {
		if ( acceptedFiles.length ) {
			updateButtonStates( { file: acceptedFiles[ 0 ] } );
		}
	}, [] );

	return (
		<InlineStack gap="300" blockAlign="center">
			{ buttons.map( ( button ) => {
				const { type, value, label, url, variant } = button || {};

				return (
					type === 'file_input' ? (
						<BlockStack key={ value } gap="400">
							<InlineStack gap="200" blockAlign="center">
								<div className="lime-product-labels__field--dropzone" style={ { width: 45, height: 28 } }>
									<DropZone
										accept="application/json"
										allowMultiple={ false }
										onDrop={ handleDrop }
									>
										<DropZone.FileUpload actionHint={ __( 'Upload JSON file', 'lime-product-labels' ) } />
									</DropZone>
								</div>
								<Button
									loading={ buttonStates.loading }
									disabled={ ! buttonStates.file }
									url={ url }
									target={ url ? '_blank' : undefined }
									variant={ variant || 'secondary' }
									type="button"
									onClick={ ( e ) => handleButtonClick( e, button, buttonStates, updateButtonStates ) }
								>
									{ label }
								</Button>
								{ buttonStates.file && (
									<InlineStack gap="200">
										<Button
											variant="plain"
											icon={ <Icon source={ XIcon } tone="critical" /> }
											onClick={ () => updateButtonStates( { file: null } ) }
											accessibilityLabel={ __( 'Remove file', 'lime-product-labels' ) }
										/>
										<BlockStack gap="0">
											<Text as="span" variant="bodySm">{ buttonStates.file.name }</Text>
											<Text as="span" tone="subdued" variant="bodyXs">
												{ formatFileSize( buttonStates.file.size ) }
											</Text>
										</BlockStack>
									</InlineStack>
								) }
							</InlineStack>
						</BlockStack>
					) : (
						<Button
							key={ value }
							loading={ buttonStates.loading }
							disabled={ buttonStates.disabled || button?.disabled }
							url={ url }
							target={ url ? '_blank' : undefined }
							variant={ variant || 'secondary' }
							type={ type }
							onClick={ ( e ) => handleButtonClick( e, button, buttonStates, updateButtonStates ) }
						>
							{ label }
						</Button>
					)
				);
			} ) }
		</InlineStack>
	);
};

export default ButtonField;
