import { __ } from '@wordpress/i18n';
import useAppStore from '@coreJS/hooks/useAppStore';
import useForm from '@admin/hooks/useForm';
import * as actionTypes from '@coreJS/store/actionTypes';

import { BlockStack, Layout } from '@shopify/polaris';
import RenderFields from '@admin/components/Fields/RenderFields';
import Preview from '@admin/components/Preview';

const localizedData = window?.LimeProductLabels || {};

const TabStyles = () => {
	const {
		options,
		initialOptions,
	} = useAppStore();

	const sections = localizedData?.fields?.styles || [];
	const initialStyles = initialOptions?.styles || {};

	const { formData, handleChange } = useForm( {
		initialData: options?.styles || {},
		actionType: actionTypes.SET_STYLES,
		initialOptions: initialStyles,
	} );

	return (
		<Layout>
			<Layout.Section>
				<div className="flex flex-col gap-md">
					{ sections?.map( ( section, index ) => {
						const { section_id } = section || {};
						return (
							<div key={ section_id || index } className={ `lime-product-labels__section lime-product-labels__section-${ section_id }` }>
								<RenderFields
									open={ true }
									title={ section?.title || '' }
									description={ section?.description || '' }
									section={ section }
									fields={ section?.fields || [] }
									formData={ formData }
									handleChange={ handleChange }
								/>
							</div>
						);
					} ) }
				</div>
			</Layout.Section>

			<Layout.Section variant="oneThird">
				<BlockStack gap="400">
					<Preview formData={ formData } />
				</BlockStack>
			</Layout.Section>
		</Layout>
	);
};

export default TabStyles;
