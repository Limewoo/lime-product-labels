import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useAppStore from '@coreJS/hooks/useAppStore';
import menus from '@admin/utils/menus';
import * as actionTypes from '@coreJS/store/actionTypes';
import { alertMessages, isMobileViewport } from '@coreJS/helpers';

import { PlusIcon, ArrowLeftIcon, ChevronDownIcon } from '@shopify/polaris-icons';
import {
	BlockStack,
	Button,
	ButtonGroup,
	InlineStack,
	Layout,
	Page,
	Text,
} from '@shopify/polaris';

const Header = () => {
	const {
		activeTab,
		labelMode,
		isFormChanged,
		isLabelChanged,
		dispatch,
		handleFormSubmit,
		setLabelMode,
	} = useAppStore();

	const [ formSubmitted, setFormSubmitted ] = useState( false );
	const [ isSticky, setIsSticky ] = useState( false );
	const [ saveDropdownOpen, setSaveDropdownOpen ] = useState( false );

	const hasChanges = isFormChanged || isLabelChanged;

	const handleCancel = ( e, context = null ) => {
		const isBackAction = context === 'back';

		if ( hasChanges ) {
			const confirmationMessage = isBackAction ? alertMessages.goBack : alertMessages.cancelSave;
			if ( ! window.confirm( confirmationMessage ) ) {
				return;
			}
		}
		dispatch( { type: actionTypes.CANCEL_SAVE } );
	};

	const buildMessage = () => {
		if ( activeTab !== 'labels' || ! labelMode ) {
			return __( 'Settings have been saved', 'lime-product-labels' );
		}
		return labelMode === 'create'
			? __( 'Label has been added', 'lime-product-labels' )
			: __( 'Label has been updated', 'lime-product-labels' );
	};

	const handleSave = async () => {
		setFormSubmitted( true );
		await handleFormSubmit( { message: buildMessage() } );
		setFormSubmitted( false );
	};

	const handleSaveAndReturn = async () => {
		setSaveDropdownOpen( false );
		setFormSubmitted( true );
		await handleFormSubmit( { message: buildMessage(), returnAfterSave: true } );
		setFormSubmitted( false );
	};

	useEffect( () => {
		if ( ! saveDropdownOpen ) return;
		const handleClickOutside = ( e ) => {
			if ( ! e.target.closest( '.save-split-btn' ) ) {
				setSaveDropdownOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => document.removeEventListener( 'mousedown', handleClickOutside );
	}, [ saveDropdownOpen ] );

	useEffect( () => {
		const handleScroll = () => {
			setIsSticky( window?.scrollY > 120 );
		};
		window?.addEventListener( 'scroll', handleScroll );
		return () => window?.removeEventListener( 'scroll', handleScroll );
	}, [] );

	const renderHeading = () => {
		const currentTab = menus.find( ( tab ) => tab.id === activeTab ) || {};
		const { title, subTitle } = currentTab?.headings || {};

		return (
			<InlineStack align="start" gap="400">
				{ ( labelMode && activeTab === 'labels' ) && (
					<BlockStack gap="0" align="center">
						<Button
							variant="tertiary"
							icon={ ArrowLeftIcon }
							accessibilityLabel={ __( 'Go back', 'lime-product-labels' ) }
							onClick={ ( e ) => handleCancel( e, 'back' ) }
						/>
					</BlockStack>
				) }
				<BlockStack gap="100">
					<Text variant="headingLg" as="h1">{ title }</Text>
					<Text variant="bodyMd" as="p">{ subTitle }</Text>
				</BlockStack>
			</InlineStack>
		);
	};

	const RenderButtons = () => {
		const isLabelTab  = activeTab === 'labels';
		const isHome      = isLabelTab && ! labelMode;
		const isLabelForm = isLabelTab && labelMode;

		if ( activeTab === 'settings' ) {
			return null;
		}

		return (
			<>
				{ isHome ? (
					<Button
						icon={ PlusIcon }
						variant="primary"
						onClick={ () => setLabelMode( 'create' ) }>
						{ __( 'Create a Label', 'lime-product-labels' ) }
					</Button>
				) : (
					<ButtonGroup gap="100">
						<Button
							variant="tertiary"
							disabled={ ! hasChanges }
							onClick={ handleCancel }>
							{ __( 'Cancel', 'lime-product-labels' ) }
						</Button>

						{ isLabelForm ? (
							<div className="save-split-btn position-relative">
								<ButtonGroup variant="segmented">
									<Button
										variant="primary"
										disabled={ ! hasChanges }
										loading={ formSubmitted }
										onClick={ handleSave }>
										{ __( 'Save', 'lime-product-labels' ) }
									</Button>

									<Button
										variant="primary"
										icon={ ChevronDownIcon }
										disabled={ ! hasChanges || formSubmitted }
										onClick={ () => setSaveDropdownOpen( ( prev ) => ! prev ) }
										accessibilityLabel={ __( 'More save options', 'lime-product-labels' ) }
									/>
								</ButtonGroup>

								{ saveDropdownOpen && hasChanges && (
									<div className="position-absolute text-center save-dropdown">
										<Button variant="plain" onClick={ handleSaveAndReturn }>
											{ __( 'Save & Return', 'lime-product-labels' ) }
										</Button>
									</div>
								) }
							</div>
						) : (
							<Button
								variant="primary"
								disabled={ ! hasChanges }
								loading={ formSubmitted }
								onClick={ handleSave }>
								{ __( 'Save', 'lime-product-labels' ) }
							</Button>
						) }
					</ButtonGroup>
				) }
			</>
		);
	};

	return (
		<div className="lime-product-labels__tab-header">
			<Page fullWidth>
				<Layout>
					<Layout.Section>
						<BlockStack gap="100">
							{ renderHeading() }
						</BlockStack>
					</Layout.Section>

					<Layout.Section variant="oneThird">
						<InlineStack gap="400" align={ isMobileViewport() ? 'start' : 'end' }>
							<div className={ `lime-product-labels__action-buttons ${ isSticky && hasChanges ? 'is-sticky' : '' }` }>
								<RenderButtons />
							</div>
						</InlineStack>
					</Layout.Section>
				</Layout>
			</Page>
		</div>
	);
};

export default Header;
