import { __ } from '@wordpress/i18n';
import { Button } from '@shopify/polaris';
import { ExternalSmallIcon, SettingsIcon } from '@shopify/polaris-icons';
import useAppStore from '@coreJS/hooks/useAppStore';
import * as actionTypes from '@coreJS/store/actionTypes';
import Navs from './Navs';
import Logo from './Common/Logo';
import { alertMessages, isMobileViewport, setActiveWPMenu } from '@coreJS/helpers';

const Topbar = () => {
	const { isFormChanged, isLabelChanged, activeTab, dispatch } = useAppStore();
	const hasChanges = isFormChanged || isLabelChanged;

	const handleNavClick = ( currentTab ) => {
		if ( hasChanges ) {
			if ( ! window.confirm( alertMessages.switchTab ) ) {
				return;
			}
		}
		dispatch( { type: actionTypes.CANCEL_SAVE } );
		dispatch( { type: actionTypes.SET_ACTIVE_TAB, payload: currentTab } );
		setActiveWPMenu( currentTab );
	};

	return (
		<div className="flex justify-between items-center lime-product-labels__topbar">
			<div className="flex items-center gap-ml lime-product-labels__topbar--start">
				<a
					href="#"
					className="box-shadow-none lime-product-labels__logo"
					onClick={ () => handleNavClick( 'labels' ) }>
					<Logo />
				</a>
				<Navs handleNavClick={ handleNavClick } />
			</div>

			{ ! isMobileViewport() && (
				<div className="flex items-center gap-xsm lime-product-labels__topbar--end">
					<Button
						id="lime-product-labels__topbar-button--settings"
						size="large"
						icon={ SettingsIcon }
						variant={ activeTab === 'settings' ? 'primary' : 'secondary' }
						onClick={ () => handleNavClick( 'settings' ) }>
						{ __( 'Settings', 'lime-product-labels' ) }
					</Button>

					<Button
						id="lime-product-labels__topbar-button--external"
						url="https://limewoo.com"
						size="large"
						icon={ ExternalSmallIcon }
						target="_blank"
						external={ true }>
						{ __( 'Official Website', 'lime-product-labels' ) }
					</Button>
				</div>
			) }
		</div>
	);
};

export default Topbar;
