import apiFetch from '@wordpress/api-fetch';

const { LimeProductLabels = {} } = window || {};

const {
	api_namespace: apiNamespace,
	option: optionKey,
	rest_path: apiPath,
	rest_nonce: restNonce,
} = LimeProductLabels;

if ( restNonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( restNonce ) );
}

export const fetchOptions = async () => {
	try {
		const response = await apiFetch( { path: apiPath } );
		return response?.[ optionKey ] || {};
	} catch ( error ) {
		console.error( '❌ Error fetching options: ', error );
		return {};
	}
};

export const saveOptions = async ( options ) => {
	if ( typeof options !== 'object' || options === null ) {
		console.warn( 'Invalid options object.' );
		return;
	}
	try {
		return await apiFetch( {
			path: apiPath,
			method: 'POST',
			data: { [ optionKey ]: options },
		} );
	} catch ( error ) {
		console.error( '❌ Error saving options: ', error );
	}
};

export const fetchProducts = async ( args = {} ) => {
	const {
		search = '',
		product_ids: productIds = [],
		limit = 20,
		page = 1,
	} = args;
	try {
		let path = `/${ apiNamespace }/products?limit=${ limit }&page=${ page }`;
		if ( Array.isArray( productIds ) && productIds.length > 0 ) {
			const query = new URLSearchParams();
			productIds.forEach( ( id ) => query.append( 'product_ids[]', id ) );
			query.append( 'limit', limit );
			path = `/${ apiNamespace }/products?${ query.toString() }`;
		} else if ( search ) {
			path = `/${ apiNamespace }/products?search=${ encodeURIComponent( search ) }&limit=${ limit }&page=${ page }`;
		}
		return await apiFetch( { path, method: 'GET' } );
	} catch ( error ) {
		console.error( 'fetchProducts error:', error );
		return [];
	}
};

export const fetchTaxonomies = async ( args = {} ) => {
	const {
		taxonomy = '',
		search = '',
		term_ids: termIds = [],
		limit = 20,
		page = 1,
	} = args;
	if ( ! taxonomy ) {
		console.warn( 'fetchTaxonomies: taxonomy parameter is required.' );
		return [];
	}
	try {
		let path = `/${ apiNamespace }/taxonomies?taxonomy=${ taxonomy }&limit=${ limit }&page=${ page }`;
		if ( Array.isArray( termIds ) && termIds.length > 0 ) {
			const query = new URLSearchParams();
			query.append( 'taxonomy', taxonomy );
			termIds.forEach( ( id ) => query.append( 'term_ids[]', id ) );
			query.append( 'limit', limit );
			path = `/${ apiNamespace }/taxonomies?${ query.toString() }`;
		} else if ( search ) {
			path = `/${ apiNamespace }/taxonomies?taxonomy=${ taxonomy }&search=${ encodeURIComponent( search ) }&limit=${ limit }&page=${ page }`;
		}
		return await apiFetch( { path, method: 'GET' } );
	} catch ( error ) {
		console.error( 'fetchTaxonomies error:', error );
		return [];
	}
};

export const fetchUsers = async ( args = {} ) => {
	const {
		search = '',
		user_ids: userIds = [],
		limit = 20,
		page = 1,
	} = args;
	try {
		let path = `/${ apiNamespace }/users?limit=${ limit }&page=${ page }`;
		if ( Array.isArray( userIds ) && userIds.length > 0 ) {
			const query = new URLSearchParams();
			userIds.forEach( ( id ) => query.append( 'user_ids[]', id ) );
			query.append( 'limit', limit );
			path = `/${ apiNamespace }/users?${ query.toString() }`;
		} else if ( search ) {
			path = `/${ apiNamespace }/users?search=${ encodeURIComponent( search ) }&limit=${ limit }&page=${ page }`;
		}
		return await apiFetch( { path, method: 'GET' } );
	} catch ( error ) {
		console.error( 'fetchUsers error:', error );
		return [];
	}
};

export const fetchUserRoles = async ( args = {} ) => {
	const {
		search = '',
		role_names: roleNames = [],
		limit = 20,
		page = 1,
	} = args;
	try {
		let path = `/${ apiNamespace }/user_roles?limit=${ limit }&page=${ page }`;
		if ( Array.isArray( roleNames ) && roleNames.length > 0 ) {
			const query = new URLSearchParams();
			roleNames.forEach( ( name ) => query.append( 'role_names[]', name ) );
			query.append( 'limit', limit );
			path = `/${ apiNamespace }/user_roles?${ query.toString() }`;
		} else if ( search ) {
			path = `/${ apiNamespace }/user_roles?search=${ encodeURIComponent( search ) }&limit=${ limit }&page=${ page }`;
		}
		return await apiFetch( { path, method: 'GET' } );
	} catch ( error ) {
		console.error( 'fetchUserRoles error:', error );
		return [];
	}
};

export const fetchCoupons = async ( args = {} ) => {
	const {
		coupon_ids: couponIds = [],
		search = '',
		page = 1,
		limit = 20,
	} = args;
	try {
		let path = `/${ apiNamespace }/coupons?limit=${ limit }&page=${ page }`;
		if ( Array.isArray( couponIds ) && couponIds.length > 0 ) {
			const query = new URLSearchParams();
			couponIds.forEach( ( id ) => query.append( 'coupon_ids[]', id ) );
			query.append( 'limit', limit );
			path = `/${ apiNamespace }/coupons?${ query.toString() }`;
		} else if ( search ) {
			path = `/${ apiNamespace }/coupons?search=${ encodeURIComponent( search ) }&limit=${ limit }&page=${ page }`;
		}
		return await apiFetch( { path, method: 'GET' } );
	} catch ( error ) {
		console.error( 'fetchCoupons error:', error );
		return [];
	}
};

export const fetchLabels = async ( page = 1, perPage = 20, search = '', status = 'all' ) => {
	const query = new URLSearchParams( { page, per_page: perPage, search, status } );
	return await apiFetch( {
		path: `/${ apiNamespace }/labels?${ query.toString() }`,
		method: 'GET',
	} );
};

export const fetchLabel = async ( labelId ) => {
	return await apiFetch( {
		path: `/${ apiNamespace }/labels/${ labelId }`,
		method: 'GET',
	} );
};

export const createLabel = async ( data ) => {
	return await apiFetch( {
		path: `/${ apiNamespace }/labels`,
		method: 'POST',
		data,
	} );
};

export const updateLabel = async ( labelId, data ) => {
	return await apiFetch( {
		path: `/${ apiNamespace }/labels/${ labelId }`,
		method: 'PUT',
		data,
	} );
};

export const deleteLabel = async ( labelId ) => {
	return await apiFetch( {
		path: `/${ apiNamespace }/labels/${ labelId }`,
		method: 'DELETE',
	} );
};

export const reorderLabels = async ( labelIds ) => {
	return await apiFetch( {
		path: `/${ apiNamespace }/labels/reorder`,
		method: 'POST',
		data: { label_ids: labelIds },
	} );
};
