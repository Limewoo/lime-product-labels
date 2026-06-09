import { useAppContext } from '@coreJS/contexts/AppContext';
import * as actionTypes from '@coreJS/store/actionTypes';

const useAppStore = () => {
	const { state, dispatch, handleFormSubmit } = useAppContext();

	const {
		options,
		initialOptions,
		activeTab,
		labelMode,
		currentLabel,
		errors,
		isFormChanged,
		isLabelChanged,
		isCancelled,
		isWidgetOpen,
	} = state;

	const setActiveTab = ( tab ) => dispatch( { type: actionTypes.SET_ACTIVE_TAB, payload: tab } );
	const setLabelMode = ( mode ) => dispatch( { type: actionTypes.SET_LABEL_MODE, payload: mode } );
	const setCurrentLabel = ( label ) => dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: label } );
	const setLabelChanged = ( changed ) => dispatch( { type: actionTypes.SET_LABEL_CHANGED, payload: changed } );
	const setFormChanged = ( changed ) => dispatch( { type: actionTypes.SET_FORM_CHANGED, payload: changed } );
	const setWidgetOpen = ( open ) => dispatch( { type: actionTypes.SET_WIDGET_VISIBILITY, payload: open } );
	const cancelLabel = () => dispatch( { type: actionTypes.CANCEL_LABEL } );
	const cancelSave = () => dispatch( { type: actionTypes.CANCEL_SAVE } );
	const resetCancel = () => dispatch( { type: actionTypes.RESET_CANCEL } );
	const setErrors = ( errs ) => dispatch( { type: actionTypes.SET_ERRORS, payload: errs } );
	const clearErrors = () => dispatch( { type: actionTypes.CLEAR_ERRORS } );

	return {
		options,
		initialOptions,
		activeTab,
		labelMode,
		currentLabel,
		errors,
		isFormChanged,
		isLabelChanged,
		isCancelled,
		isWidgetOpen,
		setActiveTab,
		setLabelMode,
		setCurrentLabel,
		setLabelChanged,
		setFormChanged,
		setWidgetOpen,
		cancelLabel,
		cancelSave,
		resetCancel,
		setErrors,
		clearErrors,
		handleFormSubmit,
		dispatch,
	};
};

export default useAppStore;
