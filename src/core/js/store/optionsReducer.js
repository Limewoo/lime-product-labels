import _ from 'lodash';
import { getCurrentTab } from '@coreJS/helpers';
import * as actionTypes from '@coreJS/store/actionTypes';

const defaultOptions = {
	styles:   {},
	settings: {},
};

const initialState = {
	options:        _.cloneDeep( defaultOptions ),
	initialOptions: _.cloneDeep( defaultOptions ),
	activeTab:      getCurrentTab( 'labels' ),
	labelMode:      null,
	currentLabel:   {},
	errors:         {},
	isFormChanged:  false,
	isLabelChanged: false,
	isCancelled:    false,
	isWidgetOpen:   false,
};

const reducer = ( state, action ) => {
	const { type, payload } = action;

	switch ( type ) {
		case actionTypes.SAVE_OPTIONS:
			return {
				...state,
				isFormChanged:  false,
				options:        payload,
				initialOptions: payload,
				errors:         {},
			};

		case actionTypes.CANCEL_SAVE:
			return {
				...state,
				options:        state.initialOptions,
				isCancelled:    true,
				labelMode:      null,
				currentLabel:   {},
				isFormChanged:  false,
				isLabelChanged: false,
				errors:         {},
			};

		case actionTypes.RESET_CANCEL:
			return { ...state, isCancelled: false };

		case actionTypes.SET_OPTIONS:
			return {
				...state,
				options:   payload ?? defaultOptions,
				labelMode: null,
			};

		case actionTypes.SET_INITIAL_OPTIONS:
			return { ...state, initialOptions: payload };

		case actionTypes.CANCEL_LABEL:
			return {
				...state,
				labelMode:    null,
				currentLabel: {},
			};

		case actionTypes.SET_STYLES:
			return {
				...state,
				options: { ...state.options, styles: payload },
			};

		case actionTypes.SET_SETTINGS:
			return {
				...state,
				options: { ...state.options, settings: payload },
			};

		case actionTypes.SET_STATUS:
			return { ...state, status: payload };

		case actionTypes.CLEAR_STATUS:
			return { ...state, status: null };

		case actionTypes.SET_ACTIVE_TAB:
			return { ...state, activeTab: payload };

		case actionTypes.SET_LABEL_MODE:
			return { ...state, labelMode: payload };

		case actionTypes.SET_CURRENT_LABEL:
			return { ...state, currentLabel: payload };

		case actionTypes.SET_FORM_CHANGED:
			return { ...state, isFormChanged: payload };

		case actionTypes.SET_LABEL_CHANGED:
			return { ...state, isLabelChanged: payload };

		case actionTypes.SET_WIDGET_VISIBILITY:
			return { ...state, isWidgetOpen: payload };

		case actionTypes.SET_ERRORS:
			return { ...state, errors: payload };

		case actionTypes.CLEAR_ERRORS:
			return { ...state, errors: {} };

		default:
			return state;
	}
};

export { initialState, reducer };
