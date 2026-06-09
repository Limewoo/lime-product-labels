import useAppStore from '@coreJS/hooks/useAppStore';
import Topbar from '@admin/components/Topbar';
import Body from '@admin/components/Body';
import Alert from '@admin/components/Common/Alert';
import Loader from '@admin/components/Common/Loader';

const AdminApp = () => {
	const { loading } = useAppStore();

	return (
		<>
			<Alert />
			<div className="lime-product-labels-wrapper">
				<form className="lime-product-labels__form">
					<Topbar />
					{ loading ? <Loader /> : <Body /> }
				</form>
			</div>
		</>
	);
};

export default AdminApp;
