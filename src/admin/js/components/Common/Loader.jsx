import { Spinner } from '@shopify/polaris';

const Loader = () => {
	return (
		<div className="flex items-center justify-center lime-product-labels__loader">
			<Spinner accessibilityLabel="Loading" size="large" />
		</div>
	);
};

export default Loader;
