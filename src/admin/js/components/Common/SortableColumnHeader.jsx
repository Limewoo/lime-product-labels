import { Icon } from '@shopify/polaris';
import { SortAscendingIcon, SortDescendingIcon } from '@shopify/polaris-icons';

const SortableColumnHeader = ( { columnKey, label, sortConfig, onSort, nameKey = 'name' } ) => {
	const isActive = sortConfig.key === columnKey;
	const ActiveIcon = isActive
		? ( sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon )
		: null;

	return (
		<div className="sortable-header" onClick={ () => onSort( columnKey ) }>
			<div className={ `flex items-center sortable-header__content ${ columnKey === nameKey ? 'padding-inline-0' : 'justify-center' }` }>
				{ label }
				{ ActiveIcon ? (
					<Icon source={ ActiveIcon } tone="base" />
				) : (
					<span className="sort-icon-hover">
						<Icon source={ SortAscendingIcon } tone="base" />
					</span>
				) }
			</div>
		</div>
	);
};

export default SortableColumnHeader;
