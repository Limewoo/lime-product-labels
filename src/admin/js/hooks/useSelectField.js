import { useState, useEffect, useRef, useCallback, useMemo } from '@wordpress/element';
import { debounce, isEqual } from 'lodash';
import { mergeUniqueBy, sortProductsWithVariations } from '@coreJS/helpers';

const useSelectField = ( props ) => {
	const {
		value = [],
		onChange = () => {},
		fetchFunction,
		cache,
		dataSource,
		multiple = true,
		idField = 'id',
		displayField = 'name',
		fetchParams = {},
		transformResponse = ( res ) => res || [],
		searchKey = 'search',
		initialLoad = true,
		onLoaded = null,
	} = props;

	const [ selected, setSelected ] = useState( [] );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ itemList, setItemList ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );

	const isInitial = useRef( true );
	const prevSelected = useRef( selected );
	const notFoundIds = useRef( new Set() );

	if ( typeof fetchFunction !== 'function' ) {
		console.error( 'fetchFunction is required for useSelectField.' );
		return {};
	}

	const loadItems = async ( args ) => {
		setIsLoading( true );
		try {
			if ( args[ searchKey ] ) {
				const raw = await fetchFunction( { ...fetchParams, ...args } );
				const results = transformResponse( raw );
				results?.forEach( ( item ) => { cache[ item[ idField ] ] = item; } );
				setItemList( results || [] );
				onLoaded?.( results );
				return results;
			}

			if ( Object.keys( cache ).length > 0 && ! args[ `${ dataSource }_ids` ] ) {
				const cachedItems = Object.values( cache );
				setItemList( ( prev ) => mergeUniqueBy( prev, cachedItems, idField ) );
				setIsLoading( false );
				return cachedItems;
			}

			const raw = await fetchFunction( { ...fetchParams, ...args } );
			const results = transformResponse( raw );
			results?.forEach( ( item ) => { cache[ item[ idField ] ] = item; } );

			if ( args[ `${ dataSource }_ids` ] ) {
				const requestedIds = args[ `${ dataSource }_ids` ];
				const foundIds = results.map( ( item ) => String( item[ idField ] ) );
				requestedIds.forEach( ( id ) => {
					if ( ! foundIds.includes( String( id ) ) ) notFoundIds.current.add( String( id ) );
				} );
			}

			setItemList( ( prev ) => mergeUniqueBy( prev, results, idField ) );
			onLoaded?.( results );
			return results;
		} catch ( error ) {
			console.error( 'useSelectField: Error fetching data', error );
			return [];
		} finally {
			setIsLoading( false );
		}
	};

	const loadItemsDebounced = useCallback( debounce( loadItems, 500 ), [] );

	useEffect( () => {
		return () => { loadItemsDebounced.cancel(); };
	}, [] );

	useEffect( () => {
		const args = {};
		if ( searchTerm.trim() ) {
			args[ searchKey ] = searchTerm;
			loadItemsDebounced( args );
		} else if ( initialLoad ) {
			if ( Object.keys( cache ).length === 0 || itemList.length === 0 ) {
				loadItems( args );
			} else {
				const cachedItems = Object.values( cache );
				setItemList( ( prev ) => mergeUniqueBy( prev, cachedItems, idField ) );
			}
		}
	}, [ searchTerm, initialLoad ] );

	useEffect( () => {
		if ( value.length === 0 ) return;

		const matched = value.map( ( id ) => cache[ id ] ).filter( ( item ) => undefined !== item );

		if ( matched.length === value.length ) {
			setSelected( multiple ? matched : matched.slice( -1 ) );
			return;
		}

		const missingIds = value.filter( ( id ) =>
			undefined === cache[ id ] && ! notFoundIds.current.has( String( id ) )
		);

		if ( missingIds.length ) {
			loadItems( { [ `${ dataSource }_ids` ]: missingIds } ).then( ( items ) => {
				items?.forEach( ( item ) => { cache[ item[ idField ] ] = item; } );
				const allMatched = value.map( ( id ) => cache[ id ] ).filter( ( item ) => undefined !== item );
				setSelected( multiple ? allMatched : allMatched.slice( -1 ) );
			} );
		}
	}, [ value, cache ] );

	useEffect( () => {
		if ( isInitial.current ) {
			isInitial.current = false;
			return;
		}
		if ( ! isEqual( prevSelected.current, selected ) ) {
			const ids = selected.map( ( item ) => item[ idField ] );
			onChange?.( ids );
			prevSelected.current = selected;
		}
	}, [ selected, onChange ] );

	const handleSelect = ( val ) => {
		const found = itemList.find( ( item ) => String( item[ idField ] ) === String( val ) );
		if ( ! found ) return;
		setSelected( ( prev ) => {
			if ( ! multiple ) return [ found ];
			const isExist = prev.find( ( item ) => item[ idField ] === found[ idField ] );
			return isExist
				? prev.filter( ( item ) => item[ idField ] !== found[ idField ] )
				: [ ...prev, found ];
		} );
	};

	const handleRemove = ( id ) => {
		setSelected( ( prev ) => prev.filter( ( item ) => item[ idField ] !== id ) );
	};

	const filteredOptions = useMemo( () => {
		let items = itemList;
		if ( searchTerm.trim() ) {
			const keyword = searchTerm.toLowerCase();
			items = items.filter( ( item ) => item[ displayField ]?.toLowerCase().includes( keyword ) );
		}
		if ( dataSource === 'product' ) {
			items = sortProductsWithVariations( items );
		}
		return items;
	}, [ searchTerm, itemList, dataSource ] );

	return {
		selected,
		setSelected,
		searchTerm,
		setSearchTerm,
		itemList,
		isLoading,
		filteredOptions,
		handleSelect,
		handleRemove,
	};
};

export default useSelectField;
