import { useState } from '@wordpress/element';
import { SortAscendingIcon, SortDescendingIcon } from '@shopify/polaris-icons';

const useSortConfig = ( initialKey = null, initialDirection = null ) => {
	const [ sortConfig, setSortConfig ] = useState( { key: initialKey, direction: initialDirection } );

	const handleSort = ( key ) => {
		setSortConfig( ( prev ) => ( {
			key,
			direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
		} ) );
	};

	const getSortIcon = ( key ) => {
		if ( sortConfig.key !== key ) return null;
		return sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon;
	};

	return { sortConfig, setSortConfig, handleSort, getSortIcon };
};

export default useSortConfig;
