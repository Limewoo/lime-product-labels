import { useState, useRef, useEffect, useCallback, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ReactSortable } from 'react-sortablejs';
import { useMutation } from '@tanstack/react-query';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
} from '@tanstack/react-table';
import useAppStore from '@coreJS/hooks/useAppStore';
import {
	fetchLabels,
	createLabel,
	updateLabel,
	deleteLabel,
	reorderLabels,
} from '@coreJS/api';
import * as actionTypes from '@coreJS/store/actionTypes';

import { Icon, Button, Badge, Spinner } from '@shopify/polaris';
import {
	DragHandleIcon,
	EditIcon,
	MenuHorizontalIcon,
	DeleteIcon,
	DuplicateIcon,
	ToggleOnIcon,
	ToggleOffIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@shopify/polaris-icons';

import { generateUUID } from '@coreJS/helpers';

const TOKEN_RE = /\{[^}]+\}/;

const renderLabelName = ( name ) => {
	if ( ! name || ! name.includes( '{' ) ) return name;
	const parts = name.split( /(\{[^}]+\})/ );
	return parts.map( ( part, i ) =>
		TOKEN_RE.test( part )
			? <span key={ i } className="label-token">{ part }</span>
			: part
	);
};
import EmptyLabels from '@admin/components/Labels/EmptyLabels';
import SortableColumnHeader from '@admin/components/Common/SortableColumnHeader';
import useSortConfig from '@admin/hooks/useSortConfig';

const sortableColumns = [
	{ key: 'name',   label: __( 'Label',  'lime-product-labels' ) },
	{ key: 'status', label: __( 'Status', 'lime-product-labels' ) },
];

const LabelsTable = () => {
	const { dispatch } = useAppStore();

	const [ pagination, setPagination ] = useState( { pageIndex: 0, pageSize: 20 } );
	const [ openCardIndex, setOpenCardIndex ] = useState( null );
	const [ sortedLabels, setSortedLabels ] = useState( null );
	const sortedListRef = useRef( null );

	const [ labelsPage, setLabelsPage ] = useState( null );
	const [ isPending, setIsPending ] = useState( true );

	const { sortConfig, setSortConfig, handleSort } = useSortConfig();

	const loadLabels = useCallback( async () => {
		setIsPending( true );
		sortedListRef.current = null;
		setSortedLabels( null );
		try {
			const res = await fetchLabels( pagination.pageIndex + 1, pagination.pageSize );
			if ( res?.success ) {
				setLabelsPage( res.data );
			}
		} catch ( e ) {
			console.error( 'Failed to fetch labels:', e );
		} finally {
			setIsPending( false );
		}
	}, [ pagination.pageIndex, pagination.pageSize ] );

	const silentReload = useCallback( async () => {
		try {
			const res = await fetchLabels( pagination.pageIndex + 1, pagination.pageSize );
			if ( res?.success ) {
				setLabelsPage( res.data );
				sortedListRef.current = null;
				setSortedLabels( null );
			}
		} catch ( e ) {
			console.error( 'Failed to fetch labels:', e );
		}
	}, [ pagination.pageIndex, pagination.pageSize ] );

	useEffect( () => {
		loadLabels();
	}, [ loadLabels ] );

	useEffect( () => {
		if ( openCardIndex === null ) return;
		const handleClickOutside = ( e ) => {
			if ( ! e.target.closest( '.label-actions' ) ) {
				setOpenCardIndex( null );
			}
		};
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => document.removeEventListener( 'mousedown', handleClickOutside );
	}, [ openCardIndex ] );

	const table = useReactTable( {
		data: sortedLabels ?? labelsPage?.labels ?? [],
		columns: [],
		pageCount: labelsPage?.pages ?? -1,
		state: { pagination },
		onPaginationChange: setPagination,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	} );

	const labels = useMemo( () => {
		const base = sortedLabels ?? labelsPage?.labels ?? [];
		if ( ! sortConfig.key ) return base;

		return [ ...base ].sort( ( a, b ) => {
			const av = ( a[ sortConfig.key ] ?? '' ).toString().toLowerCase();
			const bv = ( b[ sortConfig.key ] ?? '' ).toString().toLowerCase();
			if ( av < bv ) return sortConfig.direction === 'asc' ? -1 : 1;
			if ( av > bv ) return sortConfig.direction === 'asc' ? 1 : -1;
			return 0;
		} );
	}, [ sortedLabels, labelsPage, sortConfig ] );

	const deleteMutation = useMutation( {
		mutationFn: ( id ) => deleteLabel( id ),
		onSuccess: () => loadLabels(),
		onError: ( err ) => console.error( 'Failed to delete label:', err ),
	} );

	const duplicateMutation = useMutation( {
		mutationFn: async ( label ) => {
			const newId = generateUUID();
			await createLabel( {
				...label,
				id: newId,
				name: `${ label.name } (${ __( 'Copy', 'lime-product-labels' ) })`,
			} );
			const currentList = labelsPage?.labels ?? [];
			const originalIndex = currentList.findIndex( ( l ) => l.id === label.id );
			const newOrder = [ ...currentList ];
			newOrder.splice( originalIndex + 1, 0, { id: newId } );
			await reorderLabels( newOrder.map( ( l ) => l.id ) );
		},
		onSuccess: () => loadLabels(),
		onError: ( err ) => console.error( 'Failed to duplicate label:', err ),
	} );

	const toggleStatusMutation = useMutation( {
		mutationFn: ( label ) => {
			const newStatus = label.status === 'active' ? 'inactive' : 'active';
			return updateLabel( label.id, { ...label, status: newStatus } );
		},
		onSuccess: () => loadLabels(),
		onError: ( err ) => console.error( 'Failed to update label status:', err ),
	} );

	const reorderMutation = useMutation( {
		mutationFn: ( ids ) => reorderLabels( ids ),
		onError: ( err ) => {
			console.error( 'Failed to reorder labels:', err );
			loadLabels();
		},
	} );

	const toggleActions = ( index ) => {
		setOpenCardIndex( ( prev ) => ( prev === index ? null : index ) );
	};

	const handleEdit = ( label ) => {
		dispatch( { type: actionTypes.SET_LABEL_MODE, payload: 'update' } );
		dispatch( { type: actionTypes.SET_CURRENT_LABEL, payload: label } );
	};

	const handleDelete = async ( labelId ) => {
		if ( ! window.confirm( __( 'Are you sure you want to delete this label?', 'lime-product-labels' ) ) ) {
			return;
		}
		deleteMutation.mutate( labelId );
		setOpenCardIndex( null );
	};

	const handleDuplicate = ( label ) => {
		duplicateMutation.mutate( label );
		setOpenCardIndex( null );
	};

	const handleToggleStatus = ( label ) => {
		toggleStatusMutation.mutate( label );
		setOpenCardIndex( null );
	};

	const { pageIndex } = pagination;
	const totalPages = labelsPage?.pages ?? 1;
	const total = labelsPage?.total ?? 0;

	if ( ! isPending && total === 0 ) {
		return <EmptyLabels />;
	}

	return (
		<div className="lime-product-labels__labels lime-product-labels__labels--has-labels">
			{ isPending ? (
				<div className="text-center" style={ { padding: '2rem' } }><Spinner size="large" /></div>
			) : (
				<div className="widefat lime-product-labels-sortable">
					<div className="lime-product-labels-sortable__row lime-product-labels-sortable__header">
						<div></div>
						{ sortableColumns.map( ( column ) => (
							<SortableColumnHeader
								key={ column.key }
								columnKey={ column.key }
								label={ column.label }
								sortConfig={ sortConfig }
								onSort={ handleSort }
							/>
						) ) }
						<div>{ __( 'Actions', 'lime-product-labels' ) }</div>
					</div>

					<ReactSortable
						list={ labels }
						setList={ ( newList ) => {
							sortedListRef.current = newList;
							setSortedLabels( newList );
						} }
						tag="div"
						className="lime-product-labels-sortable__body"
						handle=".drag-handle"
						ghostClass="sortable-ghost"
						animation={ 150 }
						forceFallback={ true }
						fallbackOnBody={ true }
						onStart={ () => setSortConfig( { key: null, direction: null } ) }
						onEnd={ ( evt ) => {
							if ( evt.oldIndex !== evt.newIndex ) {
								const ids = ( sortedListRef.current ?? labels ).map( ( l ) => l.id );
								reorderMutation.mutate( ids );
							}
						} }
					>
						{ labels?.map( ( label, index ) => {
							const { id: labelId, name, status, include_products: products = [] } = label || {};
							const isActive = status === 'active';
							const labelName = renderLabelName( name || __( 'Label', 'lime-product-labels' ) );
							const isOpen = openCardIndex === index;

							return (
								<div key={ labelId } className="lime-product-labels-sortable__row">
									<div className="drag-handle text-center label-handler">
										<Icon source={ DragHandleIcon } tone="base" />
									</div>
									<div className="label-name" onClick={ () => handleEdit( label ) }>{ labelName }</div>
									<div className="label-status">
										<Badge tone={ isActive ? 'success' : 'error' }>
											{ __( isActive ? 'Active' : 'Inactive', 'lime-product-labels' ) }
										</Badge>
									</div>
									<div className="label-actions">
										<div className="flex justify-center items-center position-relative">
											<Button variant="plain" onClick={ () => handleEdit( label ) }>
												<Icon source={ EditIcon } tone="base" />
											</Button>
											<Button variant="plain" onClick={ () => toggleActions( index ) }>
												<Icon source={ MenuHorizontalIcon } tone="base" />
											</Button>

											{ isOpen && (
												<div className="position-absolute border label-actions-toggle">
													<Button icon={ isActive ? ToggleOffIcon : ToggleOnIcon } variant="plain" onClick={ () => handleToggleStatus( label ) }>
														{ isActive ? __( 'Deactivate', 'lime-product-labels' ) : __( 'Activate', 'lime-product-labels' ) }
													</Button>
													<Button icon={ DuplicateIcon } variant="plain" onClick={ () => handleDuplicate( label ) }>
														{ __( 'Duplicate', 'lime-product-labels' ) }
													</Button>
													<Button icon={ DeleteIcon } variant="plain" onClick={ () => handleDelete( labelId ) }>
														{ __( 'Remove', 'lime-product-labels' ) }
													</Button>
												</div>
											) }
										</div>
									</div>
								</div>
							);
						} ) }
					</ReactSortable>

					{ totalPages > 1 && (
						<div className="lime-product-labels__pagination">
							<Button
								variant="plain"
								icon={ ChevronLeftIcon }
								disabled={ pageIndex === 0 }
								onClick={ () => table.previousPage() }
							/>
							<span>
								{ pageIndex + 1 } / { totalPages }
								<span className="lime-product-labels__pagination-total">
									{ ' ' }({ total } { __( 'total', 'lime-product-labels' ) })
								</span>
							</span>
							<Button
								variant="plain"
								icon={ ChevronRightIcon }
								disabled={ pageIndex + 1 >= totalPages }
								onClick={ () => table.nextPage() }
							/>
						</div>
					) }
				</div>
			) }
		</div>
	);
};

export default LabelsTable;
