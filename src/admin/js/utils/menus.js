import { __ } from '@wordpress/i18n';
import TabLabels from '../components/Labels/TabLabels';
import TabStyles from '../components/Styles/TabStyles';
import TabSettings from '../components/Settings/TabSettings';

const menus = [
	{
		id: 'labels',
		label: __( 'Labels', 'lime-product-labels' ),
		component: ( props ) => <TabLabels { ...props } />,
		headings: {
			title: __( 'Lime Product Labels', 'lime-product-labels' ),
			subTitle: __( 'Add visual badge labels to your product images.', 'lime-product-labels' ),
		},
	},
	{
		id: 'styles',
		label: __( 'Styles', 'lime-product-labels' ),
		component: ( props ) => <TabStyles { ...props } />,
		headings: {
			title: __( 'Label Styles', 'lime-product-labels' ),
			subTitle: __( 'Customize the appearance of your product labels.', 'lime-product-labels' ),
		},
	},
	{
		id: 'settings',
		label: __( 'Settings', 'lime-product-labels' ),
		component: ( props ) => <TabSettings { ...props } />,
		headings: {
			title: __( 'Global Settings', 'lime-product-labels' ),
			subTitle: __( 'Plugin-wide configuration options.', 'lime-product-labels' ),
		},
	},
];

export default menus;
