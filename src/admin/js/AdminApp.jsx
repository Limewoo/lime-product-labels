import Topbar from '@admin/components/Topbar';
import Body from '@admin/components/Body';
import Alert from '@admin/components/Common/Alert';

const AdminApp = () => {
	return (
		<>
			<Alert />
			<div className="lime-product-labels-wrapper">
				<form className="lime-product-labels__form">
					<Topbar />
					<Body />
				</form>
			</div>
		</>
	);
};

export default AdminApp;
