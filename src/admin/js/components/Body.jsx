import useAppStore from '@coreJS/hooks/useAppStore';
import menus from '@admin/utils/menus';
import Header from './Header';
import Footer from './Footer';

const Body = () => {
	const { activeTab, labelMode } = useAppStore();

	const showFooter = ! labelMode && activeTab === 'labels';

	return (
		<div className="lime-product-labels__body">
			{ menus.map( ( tab ) =>
				tab.id === activeTab && (
					<div key={ tab.id } className={ `flex flex-col gap-md lime-product-labels__tab lime-product-labels__tab-${ tab.id }` }>
						<Header />
						{ tab.component ? (
							<div className="lime-product-labels__tab-content">{ tab.component( {} ) }</div>
						) : null }
						{ showFooter && <Footer /> }
					</div>
				)
			) }
		</div>
	);
};

export default Body;
