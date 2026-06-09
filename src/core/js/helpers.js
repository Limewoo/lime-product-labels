import { __ } from '@wordpress/i18n';
import _ from 'lodash';

export const getCurrentTab = ( defaultTab = 'labels', param = 'tab' ) => {
	if ( typeof window === 'undefined' || ! window.location?.search ) {
		return defaultTab;
	}
	const urlParams = new URLSearchParams( window.location.search );
	return urlParams.get( param ) || defaultTab;
};

export const getLabelURLParams = () => {
	if ( typeof window === 'undefined' || ! window.location?.search ) {
		return { labelId: null, labelMode: null };
	}
	const p = new URLSearchParams( window.location.search );
	return {
		labelId:   p.get( 'label_id' ),
		labelMode: p.get( 'label_mode' ),
	};
};

export const updateLabelURL = ( mode, labelId = null ) => {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const url = new URL( window.location );
	url.searchParams.delete( 'label_id' );
	url.searchParams.delete( 'label_mode' );
	if ( mode === 'update' && labelId ) {
		url.searchParams.set( 'label_id', labelId );
	} else if ( mode === 'create' ) {
		url.searchParams.set( 'label_mode', 'create' );
	}
	window.history.replaceState( null, '', url.toString() );
};

export const setActiveWPMenu = ( currentTab = 'labels', param = 'tab' ) => {
	const currentClass = 'current';
	const submenuItems = document.querySelectorAll( '.lime-product-labels-menu .wp-submenu li' );

	submenuItems.forEach( ( item ) => item.classList.remove( currentClass ) );

	if ( currentTab === 'labels' ) {
		const firstItem = document.querySelector( '.lime-product-labels-menu .wp-submenu li.wp-first-item' );
		if ( firstItem ) {
			firstItem.classList.add( currentClass );
		}
	} else {
		submenuItems.forEach( ( item ) => {
			const link = item.querySelector( `a[href*="tab=${ currentTab }"]` );
			if ( link ) {
				item.classList.add( currentClass );
			}
		} );
	}

	const url = new URL( window.location );
	url.searchParams.set( param, currentTab );
	window.history.replaceState( null, '', url.toString() );
};

export const evaluateConditions = ( conditions, formData ) => {
	if ( ! conditions || ! conditions.rules || ! Array.isArray( conditions.rules ) ) {
		return true;
	}

	const { logic = 'AND', rules } = conditions;

	const results = rules.map( ( rule ) => {
		const { field, operator, value } = rule;

		let fieldValue = formData[ field ];

		if ( fieldValue === undefined ) {
			if ( field.includes( '.' ) ) {
				const fieldParts = field.split( '.' );
				fieldValue = fieldParts.reduce( ( obj, key ) => {
					return obj && obj[ key ] !== undefined ? obj[ key ] : undefined;
				}, formData );
			} else {
				fieldValue = findFieldInNestedData( formData, field );
			}
		}

		switch ( operator ) {
			case 'in':
				if ( Array.isArray( fieldValue ) ) {
					return fieldValue.some( ( v ) => value.includes( v ) );
				}
				return Array.isArray( value ) ? value.includes( fieldValue ) : fieldValue === value;
			case 'not_in':
				if ( Array.isArray( fieldValue ) ) {
					return fieldValue.every( ( v ) => ! value.includes( v ) );
				}
				return Array.isArray( value ) ? ! value.includes( fieldValue ) : fieldValue !== value;
			case '===':
				return fieldValue === value || ( fieldValue === '1' && value === true ) || ( fieldValue === 1 && value === true );
			case '!==':
				return fieldValue !== value && ! ( fieldValue === '1' && value === true ) && ! ( fieldValue === 1 && value === true );
			case '>':
				return parseFloat( fieldValue ) > parseFloat( value );
			case '<':
				return parseFloat( fieldValue ) < parseFloat( value );
			case '>=':
				return parseFloat( fieldValue ) >= parseFloat( value );
			case '<=':
				return parseFloat( fieldValue ) <= parseFloat( value );
			case 'empty':
				return ! fieldValue || fieldValue === '' || ( Array.isArray( fieldValue ) && fieldValue.length === 0 );
			case 'not_empty':
				return fieldValue && fieldValue !== '' && ( ! Array.isArray( fieldValue ) || fieldValue.length > 0 );
			default:
				return false;
		}
	} );

	return logic === 'AND' ? results.every( Boolean ) : results.some( Boolean );
};

const findFieldInNestedData = ( data, fieldName ) => {
	if ( ! data || typeof data !== 'object' ) {
		return undefined;
	}
	if ( data[ fieldName ] !== undefined ) {
		return data[ fieldName ];
	}
	for ( const key in data ) {
		if ( data.hasOwnProperty( key ) ) {
			const value = data[ key ];
			if ( Array.isArray( value ) ) {
				for ( const item of value ) {
					const found = findFieldInNestedData( item, fieldName );
					if ( found !== undefined ) {
						return found;
					}
				}
			} else if ( value && typeof value === 'object' ) {
				const found = findFieldInNestedData( value, fieldName );
				if ( found !== undefined ) {
					return found;
				}
			}
		}
	}
	return undefined;
};

export const getDefaultData = ( fields ) => {
	const data = {};
	if ( ! Array.isArray( fields ) ) {
		return data;
	}
	const skipFieldTypes = new Set( [ 'note', 'button' ] );
	for ( const field of fields ) {
		const {
			id: fieldId,
			type: fieldType,
			default: defaultValue = '',
			fields: subFields,
		} = field || {};
		if ( ! fieldId || skipFieldTypes.has( fieldType ) ) {
			continue;
		}
		if ( fieldType === 'group' && Array.isArray( subFields ) ) {
			data[ fieldId ] = [ getDefaultData( subFields ) ];
		} else {
			data[ fieldId ] = defaultValue;
		}
	}
	return data;
};

export const buildDefaultSectionData = ( sections = [] ) => {
	return sections.reduce( ( acc, section ) => ( {
		...acc,
		...getDefaultData( section?.fields ),
	} ), {} );
};

export const mergeUniqueBy = ( base, additions, key = 'id' ) => {
	return _.uniqBy( [ ...base, ...additions ], key );
};

export const generateUUID = () => {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : ( r & 0x3 | 0x8 );
		return v.toString( 16 );
	} );
};

export const sortProductsWithVariations = ( products ) => {
	const variableProducts = {};
	const variations = {};
	const simpleProducts = [];

	products.forEach( ( product ) => {
		if ( product.parent_id && product.parent_id > 0 ) {
			const parentId = product.parent_id;
			if ( ! variations[ parentId ] ) {
				variations[ parentId ] = [];
			}
			variations[ parentId ].push( product );
		} else {
			const hasVariations = products.some( ( p ) => p.parent_id === product.id );
			if ( hasVariations ) {
				variableProducts[ product.id ] = product;
			} else {
				simpleProducts.push( product );
			}
		}
	} );

	Object.keys( variations ).forEach( ( parentId ) => {
		variations[ parentId ].sort( ( a, b ) => a.name.localeCompare( b.name ) );
	} );

	const sortedProducts = [];
	simpleProducts.sort( ( a, b ) => a.name.localeCompare( b.name ) );
	sortedProducts.push( ...simpleProducts );

	const sortedVariableProducts = Object.values( variableProducts )
		.sort( ( a, b ) => a.name.localeCompare( b.name ) );

	sortedVariableProducts.forEach( ( variableProduct ) => {
		sortedProducts.push( variableProduct );
		if ( variations[ variableProduct.id ] ) {
			sortedProducts.push( ...variations[ variableProduct.id ] );
		}
	} );

	return sortedProducts;
};

export const alertMessages = {
	goBack: __( 'Are you sure you want to go back? Unsaved changes will be lost. Click "Save" to keep your changes.', 'lime-product-labels' ),
	cancelSave: __( 'Are you sure you want to cancel? Unsaved changes will be lost. Click "Save" to keep your changes.', 'lime-product-labels' ),
	switchTab: __( 'Are you sure you want to switch tabs? Unsaved changes will be lost. Click "Save" to keep your changes.', 'lime-product-labels' ),
};

export const isMobileViewport = () => {
	return typeof window !== 'undefined' && window.innerWidth <= 768;
};
