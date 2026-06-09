import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import _ from 'lodash';
import useAppStore from '@coreJS/hooks/useAppStore';
import * as actionTypes from '@coreJS/store/actionTypes';

const useForm = ( props ) => {
	const {
		initialData,
		actionType,
		initialOptions,
		onDispatch,
		onChange,
	} = props;

	const { dispatch, isCancelled } = useAppStore();
	const [ formData, setFormData ] = useState( initialData );

	const debouncedDispatchRef = useRef(
		_.debounce( ( updatedData ) => {
			if ( onDispatch ) {
				onDispatch( updatedData );
			} else if ( actionType ) {
				dispatch( { type: actionType, payload: updatedData } );
				dispatch( { type: actionTypes.SET_FORM_CHANGED, payload: true } );
			}
		}, 320 )
	);

	const debouncedDispatch = debouncedDispatchRef.current;

	const scheduleDispatch = ( updatedData ) => {
		Promise.resolve().then( () => {
			debouncedDispatch( updatedData );
		} );
	};

	const handleChange = useCallback( ( value, fieldId ) => {
		setFormData( ( prevData ) => {
			const newValue = typeof value === 'function' ? value( prevData[ fieldId ] ) : value;

			if ( _.isEqual( prevData[ fieldId ], newValue ) ) {
				return prevData;
			}

			const updatedData = { ...prevData, [ fieldId ]: newValue };
			scheduleDispatch( updatedData );
			onChange?.( updatedData, fieldId, newValue );

			Promise.resolve().then( () => {
				document.dispatchEvent( new CustomEvent( 'lime-product-labels:field-change', {
					detail: { fieldId, value: newValue, formData: updatedData },
				} ) );
			} );

			return updatedData;
		} );
	}, [ debouncedDispatch, onChange ] );

	useEffect( () => {
		return () => {
			debouncedDispatch.cancel();
		};
	}, [ debouncedDispatch ] );

	useEffect( () => {
		if ( isCancelled && initialOptions ) {
			setFormData( initialOptions );
			dispatch( { type: actionTypes.RESET_CANCEL } );
		}
	}, [ isCancelled, initialOptions, dispatch ] );

	return { formData, setFormData, handleChange };
};

export default useForm;
