import { useEffect, useMemo } from '@wordpress/element';
import _ from 'lodash';
import useAppStore from '@coreJS/hooks/useAppStore';
import * as actionTypes from '@coreJS/store/actionTypes';

import { BlockStack, Layout } from '@shopify/polaris';
import { generateUUID } from '@coreJS/helpers';
import useForm from '@admin/hooks/useForm';
import Preview from '@admin/components/Preview';
import RenderFields from '@admin/components/Fields/RenderFields';

const localizedData = window?.LimeProductLabels || {};

const LabelForm = () => {
	const {
		labelMode,
		currentLabel,
		dispatch,
	} = useAppStore();

	const isUpdateMode = labelMode === 'update';
	const sections = localizedData?.fields?.labels || [];

	const generalSections = sections.filter( ( section ) => section.section_id !== 'action' );
	const actionSection   = sections.find( ( section ) => section.section_id === 'action' );

	const initialData = useMemo( () => {
		if ( isUpdateMode && Object.keys( currentLabel ).length ) {
			return currentLabel;
		}
		const defaults = sections.reduce( ( acc, section ) => {
			( section.fields || [] ).forEach( ( field ) => {
				if ( field.id && field.default !== undefined ) {
					acc[ field.id ] = field.default;
				}
			} );
			return acc;
		}, {} );
		return { ...defaults, id: generateUUID() };
	}, [ isUpdateMode, currentLabel ] );

	const onDispatch = ( updatedData ) => {
		dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: updatedData } );
		dispatch( { type: actionTypes.SET_LABEL_CHANGED, payload: true } );
	};

	const { formData, handleChange } = useForm( {
		initialData,
		dispatch,
		onDispatch,
	} );

	useEffect( () => {
		if ( isUpdateMode ) {
			const changed = ! _.isEqual( formData, currentLabel );
			dispatch( { type: actionTypes.SET_LABEL_CHANGED, payload: changed } );
		}
	}, [ formData ] );

	useEffect( () => {
		if ( labelMode === 'create' ) {
			dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: formData } );
		}
	}, [] );

	return (
		<Layout>
			<Layout.Section>
				<BlockStack gap="400">
					{ generalSections.map( ( section ) => {
						const filteredFields = ( section?.fields || [] ).filter(
							( field ) => field.id !== 'status'
						);

						if ( ! filteredFields.length ) {
							return null;
						}

						const { section_id, classes, accordion } = section || {};

						return (
							<div
								key={ section_id }
								className={ `lime-product-labels__section ${ classes || '' } lime-product-labels__section-${ section_id }` }
							>
								<RenderFields
									open={ true }
									title={ section?.title || '' }
									description={ section?.description || '' }
									section={ section }
									fields={ filteredFields }
									formData={ formData }
									handleChange={ handleChange }
									disableAccordion={ accordion === false }
								/>
							</div>
						);
					} ) }
				</BlockStack>
			</Layout.Section>

			<Layout.Section variant="oneThird">
				<BlockStack gap="400">
					{ actionSection && (
						<RenderFields
							open={ true }
							title={ actionSection?.title || '' }
							description={ actionSection?.description || '' }
							section={ actionSection }
							fields={ actionSection.fields || [] }
							formData={ formData }
							handleChange={ handleChange }
						/>
					) }
					<Preview formData={ formData } />
				</BlockStack>
			</Layout.Section>
		</Layout>
	);
};

export default LabelForm;
