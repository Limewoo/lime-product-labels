import renderApp from '@coreJS/renderApp';
import AdminApp from './AdminApp';
import './custom';

import '@shopify/polaris/build/esm/styles.css';
import '../scss/index.scss';
import '../../frontend/scss/index.scss';

renderApp( AdminApp );
