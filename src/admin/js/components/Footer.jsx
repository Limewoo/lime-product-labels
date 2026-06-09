import { __ } from '@wordpress/i18n';
import { BookOpenIcon, ChatIcon, LightbulbIcon, StarIcon } from '@shopify/polaris-icons';
import FooterCard from './Common/FooterCard';

const resourceCards = [
	{
		id: 'documentation',
		icon: BookOpenIcon,
		title: __( 'Documentation', 'lime-product-labels' ),
		linkText: __( 'Read', 'lime-product-labels' ),
		url: 'https://wordpress.org/plugins/lime-product-labels/',
	},
	{
		id: 'support',
		icon: ChatIcon,
		title: __( 'Support', 'lime-product-labels' ),
		linkText: __( 'Get help', 'lime-product-labels' ),
		url: 'https://wordpress.org/support/plugin/lime-product-labels/',
	},
	{
		id: 'feature',
		icon: LightbulbIcon,
		title: __( 'Feature Request', 'lime-product-labels' ),
		linkText: __( 'Suggest an idea', 'lime-product-labels' ),
		url: 'https://wordpress.org/support/plugin/lime-product-labels/',
	},
	{
		id: 'review',
		icon: StarIcon,
		title: __( 'Review', 'lime-product-labels' ),
		linkText: __( 'Leave a review', 'lime-product-labels' ),
		url: 'https://wordpress.org/support/plugin/lime-product-labels/reviews/',
	},
];

const Footer = () => {
	return (
		<div className="lime-product-labels__tab-content__footer">
			<div className="lime-product-labels__cards lime-product-labels__cards-4">
				{ resourceCards.map( ( card ) => (
					<FooterCard card={ card } key={ card.id } />
				) ) }
			</div>
		</div>
	);
};

export default Footer;
