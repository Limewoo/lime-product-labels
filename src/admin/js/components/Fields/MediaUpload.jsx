import { useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { BlockStack, Button, Label, Spinner, Text } from '@shopify/polaris';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { uploadMedia } from '@coreJS/api';

const ALLOWED_TYPES = [ 'image/png', 'image/jpeg', 'image/svg+xml' ];

const MediaUpload = ( props ) => {
	const { fieldId, fieldLabel, labelHidden, helpText, value, onChange } = props;

	const frameRef = useRef( null );
	const [ isDragging, setIsDragging ] = useState( false );
	const [ isUploading, setIsUploading ] = useState( false );
	const [ uploadError, setUploadError ] = useState( '' );

	const image = value && typeof value === 'object' && value.url ? value : null;

	const openFrame = () => {
		if ( ! window.wp?.media ) {
			return;
		}

		if ( ! frameRef.current ) {
			const frame = window.wp.media( {
				title: __( 'Select label image', 'lime-product-labels' ),
				button: { text: __( 'Use this image', 'lime-product-labels' ) },
				library: { type: ALLOWED_TYPES },
				multiple: false,
			} );

			frame.on( 'select', () => {
				const attachment = frame.state().get( 'selection' ).first()?.toJSON();

				if ( ! attachment || ! ALLOWED_TYPES.includes( attachment.mime ) ) {
					return;
				}

				setUploadError( '' );
				onChange( {
					id: attachment.id,
					url: attachment.url,
					alt: attachment.alt || '',
				} );
			} );

			frameRef.current = frame;
		}

		frameRef.current.open();
	};

	const handleKeyDown = ( e ) => {
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			openFrame();
		}
	};

	const handleDragOver = ( e ) => {
		e.preventDefault();
		setIsDragging( true );
	};

	const handleDragLeave = ( e ) => {
		e.preventDefault();
		setIsDragging( false );
	};

	const handleDrop = async ( e ) => {
		e.preventDefault();
		setIsDragging( false );

		if ( isUploading ) {
			return;
		}

		const file = e.dataTransfer?.files?.[0];

		if ( ! file ) {
			return;
		}

		if ( ! ALLOWED_TYPES.includes( file.type ) ) {
			setUploadError( __( 'Only PNG, JPG and SVG files are allowed.', 'lime-product-labels' ) );
			return;
		}

		setUploadError( '' );
		setIsUploading( true );

		try {
			const attachment = await uploadMedia( file );

			onChange( {
				id: attachment.id,
				url: attachment.source_url,
				alt: attachment.alt_text || '',
			} );
		} catch ( error ) {
			setUploadError( error?.message || __( 'Upload failed. Please try again.', 'lime-product-labels' ) );
		} finally {
			setIsUploading( false );
		}
	};

	const previewClasses = [
		'lime-product-labels__media-preview',
		image ? 'has-image' : '',
		isDragging ? 'is-dragging' : '',
	].filter( Boolean ).join( ' ' );

	return (
		<BlockStack gap="200">
			{ ( fieldLabel && ! labelHidden ) && <Label id={ fieldId }>{ fieldLabel }</Label> }

			<div
				className={ previewClasses }
				onClick={ openFrame }
				onKeyDown={ handleKeyDown }
				onDragOver={ handleDragOver }
				onDragLeave={ handleDragLeave }
				onDrop={ handleDrop }
				role="button"
				tabIndex={ 0 }
			>
				{ isUploading ? (
					<Spinner size="small" accessibilityLabel={ __( 'Uploading image', 'lime-product-labels' ) } />
				) : image ? (
					<img src={ image.url } alt={ image.alt || '' } />
				) : (
					<Text as="span" variant="bodySm" tone="subdued">
						{ __( 'Drop an image here, or click to select', 'lime-product-labels' ) }
					</Text>
				) }

				{ image && ! isUploading && (
					/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
					<div
						className="lime-product-labels__media-actions"
						onClick={ ( e ) => e.stopPropagation() }
					>
						<Button
							variant="plain"
							icon={ EditIcon }
							accessibilityLabel={ __( 'Replace image', 'lime-product-labels' ) }
							onClick={ openFrame }
						/>
						<Button
							variant="plain"
							icon={ DeleteIcon }
							tone="critical"
							accessibilityLabel={ __( 'Remove image', 'lime-product-labels' ) }
							onClick={ () => onChange( '' ) }
						/>
					</div>
				) }
			</div>

			{ uploadError && <Text as="span" variant="bodySm" tone="critical">{ uploadError }</Text> }
			{ helpText && <Text as="span" variant="bodySm" tone="subdued">{ helpText }</Text> }
		</BlockStack>
	);
};

export default MediaUpload;
