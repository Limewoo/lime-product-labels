import { __ } from '@wordpress/i18n';
import useAppStore from '@coreJS/hooks/useAppStore';
import useForm from '@admin/hooks/useForm';
import { exportLabels, importLabels } from '@coreJS/api';
import * as actionTypes from '@coreJS/store/actionTypes';
import { isMobileViewport } from '@coreJS/helpers';

import { Layout } from '@shopify/polaris';
import RenderFields from '@admin/components/Fields/RenderFields';

const localizedData = window?.LimeProductLabels || {};
const flexDirection = isMobileViewport() ? 'column' : 'row';

const TabSettings = () => {
	const { options, initialOptions } = useAppStore();

	const sections = localizedData?.fields?.settings || [];
	const initialSettings = initialOptions?.settings || {};

	const { formData, handleChange } = useForm( {
		initialData: options?.settings || {},
		actionType: actionTypes.SET_SETTINGS,
		initialOptions: initialSettings,
	} );

	const handleExport = async ( button, buttonStates, updateButtonStates ) => {
		try {
			updateButtonStates( { loading: true } );

			const { success, data, file, message } = await exportLabels();

			if ( ! success ) {
				alert( message );
				return;
			}

			const blob = new Blob( [ JSON.stringify( data, null, 2 ) ], { type: 'application/json' } );
			const url = URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;
			link.download = file;
			document.body.appendChild( link );
			link.click();
			link.remove();
			URL.revokeObjectURL( url );
		} catch {
			alert( __( 'Failed to export labels.', 'lime-product-labels' ) );
		} finally {
			updateButtonStates( { loading: false } );
		}
	};

	const handleImport = async ( button, buttonStates, updateButtonStates ) => {
		if ( ! window.confirm( __( 'Are you sure you want to import labels? Existing labels with matching IDs will be overwritten.', 'lime-product-labels' ) ) ) {
			return;
		}

		const { file } = buttonStates || {};

		if ( ! file ) {
			alert( __( 'Please select a file to import.', 'lime-product-labels' ) );
			return;
		}

		if ( ! file.name.endsWith( '.json' ) && file.type !== 'application/json' ) {
			alert( __( 'Please select a valid JSON file.', 'lime-product-labels' ) );
			return;
		}

		try {
			updateButtonStates( { loading: true } );

			const text = await file.text();
			const { success, message } = await importLabels( text );

			if ( ! success ) {
				alert( message || __( 'Failed to import labels.', 'lime-product-labels' ) );
				return;
			}

			alert( message || __( 'Labels imported successfully.', 'lime-product-labels' ) );
		} catch ( error ) {
			console.error( 'Import error:', error );
			alert( __( 'Failed to import labels.', 'lime-product-labels' ) );
		} finally {
			updateButtonStates( { loading: false, file: null } );
		}
	};

	return (
		<Layout>
			<Layout.Section>
				<div className="flex flex-col gap-md">
					{ sections?.map( ( section ) => {
						const { section_id } = section || {};
						return (
							<div key={ section_id } className={ `lime-product-labels__section lime-product-labels__section--${ flexDirection } lime-product-labels__section-${ section_id }` }>
								<RenderFields
									disableAccordion={ true }
									title={ section?.title || '' }
									description={ section?.description || '' }
									section={ section }
									fields={ section?.fields || [] }
									formData={ formData }
									flexDirection={ flexDirection }
									handleChange={ handleChange }
									handleButtonClick={ ( e, button, buttonStates, updateButtonStates ) => {
										e.preventDefault();
										const action = button?.value || '';
										if ( action === 'export' ) {
											handleExport( button, buttonStates, updateButtonStates );
										} else if ( action === 'import' ) {
											handleImport( button, buttonStates, updateButtonStates );
										}
									} }
								/>
							</div>
						);
					} ) }
				</div>
			</Layout.Section>
		</Layout>
	);
};

export default TabSettings;
