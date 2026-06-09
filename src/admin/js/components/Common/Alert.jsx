import { ToastBar, Toaster } from 'react-hot-toast';

const Alert = () => {
	return (
		<Toaster
			position="top-right"
			reverseOrder={ false }
			containerStyle={ {
				top: 100,
				right: 25,
			} }
			toastOptions={ {
				duration: 3000,
				style: {
					color: '#fff',
					border: '1px solid #e3e3e3',
					fontWeight: '500',
				},
				iconTheme: {
					primary: '#fff',
					secondary: '#1a1a1a',
				},
				success: {
					style: {
						background: '#1a1a1a',
						borderColor: '#303030',
					},
				},
				error: {
					style: {
						background: '#dc2626',
						borderColor: '#ef4444',
					},
				},
			} }
		>
			{ ( t ) => (
				<ToastBar
					toast={ t }
					style={ {
						...t.style,
						animation: t.visible
							? 'toast-slide-in 0.25s ease-out'
							: 'toast-slide-out 0.25s ease-in forwards',
					} }
				/>
			) }
		</Toaster>
	);
};

export default Alert;
