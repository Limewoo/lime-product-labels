import useAppStore from '@coreJS/hooks/useAppStore';
import { BlockStack } from '@shopify/polaris';
import LabelsTable from './LabelsTable';
import LabelForm from './LabelForm';

const TabLabels = () => {
	const { labelMode } = useAppStore();

	return labelMode ? <LabelForm /> : (
		<BlockStack gap="400">
			<LabelsTable />
		</BlockStack>
	);
};

export default TabLabels;
