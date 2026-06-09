import { createContext, useContext, useReducer, useEffect, useCallback, useState } from '@wordpress/element';
import toast from 'react-hot-toast';
import { __ } from '@wordpress/i18n';
import { initialState, reducer } from '@coreJS/store/optionsReducer';
import * as actionTypes from '@coreJS/store/actionTypes';
import { fetchOptions, saveOptions, fetchLabel, createLabel, updateLabel } from '@coreJS/api';
import { getLabelURLParams, updateLabelURL } from '@coreJS/helpers';

const AppContext = createContext( null );

const localizedData = window?.LimeProductLabels || {};

export const AppProvider = ( { children, mode = 'admin' } ) => {
	const [ state, dispatch ] = useReducer( reducer, initialState );
	const [ loading, setLoading ] = useState( true );

	const fetchData = useCallback( async () => {
		try {
			const options = await fetchOptions();
			dispatch( { type: actionTypes.SET_OPTIONS, payload: options } );
			dispatch( { type: actionTypes.SET_INITIAL_OPTIONS, payload: options } );

			if ( mode !== 'admin' ) {
				return;
			}

			const { labelId, labelMode } = getLabelURLParams();

			if ( labelId ) {
				try {
					const label = await fetchLabel( labelId );
					dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: label } );
					dispatch( { type: actionTypes.SET_LABEL_MODE, payload: 'update' } );
				} catch {
					updateLabelURL( null );
				}
			} else if ( labelMode === 'create' ) {
				dispatch( { type: actionTypes.SET_LABEL_MODE, payload: 'create' } );
			}
		} finally {
			setLoading( false );
		}
	}, [ mode ] );

	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	useEffect( () => {
		if ( loading || mode !== 'admin' ) {
			return;
		}
		const { labelMode, currentLabel } = state;
		if ( labelMode === 'update' && currentLabel?.id ) {
			updateLabelURL( 'update', currentLabel.id );
		} else if ( labelMode === 'create' ) {
			updateLabelURL( 'create' );
		} else if ( ! labelMode ) {
			updateLabelURL( null );
		}
	}, [ state.labelMode, state.currentLabel, mode, loading ] );

	/**
	 * @param {Object} opts
	 * @param {string}  [opts.message]         Toast message on success.
	 * @param {boolean} [opts.returnAfterSave]  If true, return to table after save.
	 */
	const handleFormSubmit = useCallback( async ( opts = {} ) => {
		const { message = __( 'Saved', 'lime-product-labels' ), returnAfterSave = false } = opts;
		const { labelMode, currentLabel, options } = state;

		try {
			if ( labelMode === 'create' || labelMode === 'update' ) {
				if ( labelMode === 'create' ) {
					const created = await createLabel( currentLabel );
					dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: created } );
					dispatch( { type: actionTypes.SET_LABEL_MODE, payload: 'update' } );
					dispatch( { type: actionTypes.SET_LABEL_CHANGED, payload: false } );
				} else {
					const updated = await updateLabel( currentLabel.id, currentLabel );
					dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: updated } );
					dispatch( { type: actionTypes.SET_LABEL_CHANGED, payload: false } );
				}

				toast.success( message );

				if ( returnAfterSave ) {
					dispatch( { type: actionTypes.CANCEL_LABEL } );
				}
				return;
			}

			const { styles, settings } = options;
			const payload = { styles, settings };
			const response = await saveOptions( payload );
			const saved = response?.[ localizedData.option ] || payload;
			dispatch( { type: actionTypes.SAVE_OPTIONS, payload: saved } );
			dispatch( { type: actionTypes.SET_INITIAL_OPTIONS, payload: saved } );
			toast.success( message );
		} catch ( err ) {
			console.error( 'handleFormSubmit error:', err );
			toast.error( __( 'An error occurred. Please try again.', 'lime-product-labels' ) );
		}
	}, [ state ] );

	return (
		<AppContext.Provider value={ { state, dispatch, handleFormSubmit, loading } }>
			{ children }
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext( AppContext );
	if ( ! context ) {
		throw new Error( 'useAppContext must be used within AppProvider' );
	}
	return context;
};

export default AppContext;
