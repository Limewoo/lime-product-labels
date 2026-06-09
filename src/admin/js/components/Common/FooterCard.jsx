import { Card, Icon } from '@shopify/polaris';

const FooterCard = ( { card } ) => {
	const { icon, title, linkText, url } = card;

	return (
		<Card roundedAbove="xs">
			<div className="lime-product-labels__card">
				<span className="lime-product-labels__card__icon">
					<Icon source={ icon } tone="base" />
				</span>
				<div className="lime-product-labels__card__title">{ title }</div>
				<a href={ url } className="lime-product-labels__card__link" target="_blank" rel="noreferrer noopener">{ linkText }</a>
			</div>
		</Card>
	);
};

export default FooterCard;
