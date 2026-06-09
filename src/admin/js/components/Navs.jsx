import { Button } from '@wordpress/components';
import useAppStore from '@coreJS/hooks/useAppStore';
import menus from '@admin/utils/menus';
import { isMobileViewport } from '@coreJS/helpers';

const Navs = ( { handleNavClick } ) => {
	const { activeTab } = useAppStore();

	return (
		<nav>
			<ul className="flex items-center gap-sm lime-product-labels__tab-navs">
				{ menus.map( ( menu ) => {
					const { id: currentTab, label } = menu;

					if ( currentTab === 'settings' && ! isMobileViewport() ) {
						return null;
					}

					return (
						<li key={ currentTab }>
							<Button isPrimary={ activeTab === currentTab } onClick={ () => handleNavClick( currentTab ) }>
								{ label }
							</Button>
						</li>
					);
				} ) }
			</ul>
		</nav>
	);
};

export default Navs;
