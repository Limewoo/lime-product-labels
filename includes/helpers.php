<?php
/**
 * Helper functions for Lime Product Labels.
 *
 * @package lime-product-labels
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'limewoo_lpl_get_option_data' ) ) {
	/**
	 * Retrieve option data from the Lime Product Labels options.
	 *
	 * @since 1.0.0
	 *
	 * @param string|null $key Optional key to return a specific section. Default null returns all data.
	 *
	 * @return array|mixed
	 */
	function limewoo_lpl_get_option_data( $key = null ) {
		static $data = null;

		if ( is_null( $data ) ) {
			$data = get_option( LWPL_OPTION_KEY, array() );
		}

		return is_null( $key ) ? $data : ( $data[ $key ] ?? array() );
	}
}

if ( ! function_exists( 'limewoo_lpl_ensure_int_array' ) ) {
	/**
	 * Normalize a list of IDs into an array of integers.
	 *
	 * @since 1.0.0
	 *
	 * @param string|array $ids Comma-separated string or array of IDs.
	 * @return array Array of integers.
	 */
	function limewoo_lpl_ensure_int_array( $ids ) {
		if ( empty( $ids ) ) {
			return array();
		}

		$id_list = is_array( $ids ) ? $ids : explode( ',', $ids );

		return array_map( 'intval', $id_list );
	}
}

if ( ! function_exists( 'limewoo_lpl_kses_allowed_tags' ) ) {
	/**
	 * Get allowed tags for wp_kses.
	 *
	 * @since 1.0.0
	 *
	 * @param array $extra            Extra tags to merge.
	 * @param bool  $include_post_tags Whether to include standard post tags.
	 * @return array
	 */
	function limewoo_lpl_kses_allowed_tags( $extra = array(), $include_post_tags = true ) {
		$allowed_tags = array(
			'meta'     => array(
				'name'    => true,
				'content' => true,
			),
			'svg'      => array(
				'class'           => true,
				'xmlns'           => true,
				'width'           => true,
				'height'          => true,
				'viewbox'         => true,
				'aria-hidden'     => true,
				'role'            => true,
				'focusable'       => true,
				'fill'            => true,
				'stroke'          => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'stroke-width'    => true,
			),
			'g'        => array(
				'id'        => true,
				'class'     => true,
				'clip-path' => true,
				'style'     => true,
				'transform' => true,
			),
			'path'     => array(
				'fill'            => true,
				'fill-rule'       => true,
				'd'               => true,
				'transform'       => true,
				'stroke'          => true,
				'stroke-width'    => true,
				'stroke-linejoin' => true,
				'clip-rule'       => true,
				'opacity'         => true,
			),
			'polyline' => array(
				'points'          => true,
				'fill'            => true,
				'fill-rule'       => true,
				'd'               => true,
				'transform'       => true,
				'stroke'          => true,
				'stroke-width'    => true,
				'stroke-linejoin' => true,
			),
			'polygon'  => array(
				'fill'         => true,
				'fill-rule'    => true,
				'points'       => true,
				'transform'    => true,
				'focusable'    => true,
				'stroke'       => true,
				'stroke-width' => true,
			),
			'rect'     => array(
				'x'            => true,
				'y'            => true,
				'rx'           => true,
				'width'        => true,
				'height'       => true,
				'transform'    => true,
				'fill'         => true,
				'stroke'       => true,
				'stroke-width' => true,
			),
			'circle'   => array(
				'cx'              => true,
				'cy'              => true,
				'r'               => true,
				'width'           => true,
				'height'          => true,
				'transform'       => true,
				'fill'            => true,
				'stroke'          => true,
				'stroke-width'    => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
			),
			'line'     => array(
				'x1'              => true,
				'y1'              => true,
				'x2'              => true,
				'y2'              => true,
				'width'           => true,
				'height'          => true,
				'transform'       => true,
				'fill'            => true,
				'stroke'          => true,
				'stroke-width'    => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
			),
			'clipPath' => array(
				'id'    => true,
				'class' => true,
				'style' => true,
			),
			'defs'     => array(
				'id' => true,
			),
			'progress' => array(
				'id'    => true,
				'class' => true,
				'value' => true,
				'max'   => true,
			),
		);

		if ( $include_post_tags ) {
			$allowed_tags = array_merge( $allowed_tags, wp_kses_allowed_html( 'post' ) );
		}

		$allowed_tags['img'] = array(
			'src'      => true,
			'class'    => true,
			'alt'      => true,
			'width'    => true,
			'height'   => true,
			'srcset'   => true,
			'sizes'    => true,
			'data-*'   => true,
			'decoding' => true,
			'loading'  => true,
		);

		$allowed_tags['span'] = array(
			'class'  => true,
			'id'     => true,
			'style'  => true,
			'data-*' => true,
		);

		$allowed_tags['select'] = array(
			'name'     => true,
			'class'    => true,
			'id'       => true,
			'style'    => true,
			'data-*'   => true,
			'multiple' => true,
			'disabled' => true,
		);

		$allowed_tags['option'] = array(
			'value'    => true,
			'selected' => true,
			'data-*'   => true,
		);

		$allowed_tags['div'] = array(
			'class'  => true,
			'id'     => true,
			'style'  => true,
			'data-*' => true,
		);

		$allowed_tags['a'] = array(
			'href'   => true,
			'class'  => true,
			'title'  => true,
			'target' => true,
			'data-*' => true,
		);

		return apply_filters( 'limewoo_lpl_kses_allowed_tags', array_merge( $allowed_tags, $extra ) );
	}
}

if ( ! function_exists( 'limewoo_lpl_kses' ) ) {
	/**
	 * Safe output helper for HTML.
	 *
	 * @since 1.0.0
	 *
	 * @param string $html Raw HTML.
	 * @return string
	 */
	function limewoo_lpl_kses( $html ) {
		return wp_kses( $html, limewoo_lpl_kses_allowed_tags() );
	}
}

if ( ! function_exists( 'limewoo_lpl_get_products' ) ) {
	/**
	 * Retrieves a list of WooCommerce products.
	 *
	 * @since 1.0.0
	 *
	 * @param array $args {
	 *     Optional. Array of arguments.
	 *
	 *     @type string $search           A search string to filter products.
	 *     @type int[]  $product_ids      Product IDs to pin at the top.
	 *     @type int    $page             Page number for pagination.
	 *     @type int    $limit            Products per page.
	 *     @type bool   $include_defaults Whether to include the paginated list.
	 * }
	 * @return array
	 */
	function limewoo_lpl_get_products( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'search'           => '',
				'product_ids'      => array(),
				'page'             => 1,
				'limit'            => 20,
				'include_defaults' => false,
			)
		);

		$product_ids      = array_filter( array_map( 'absint', (array) $args['product_ids'] ) );
		$limit            = absint( $args['limit'] );
		$page             = absint( $args['page'] );
		$search           = sanitize_text_field( $args['search'] );
		$include_defaults = (bool) $args['include_defaults'];

		$pinned_products = array();
		$product_list    = array();

		if ( ! empty( $product_ids ) ) {
			$pinned_query = wc_get_products(
				array(
					'include' => $product_ids,
					'status'  => 'publish',
					'return'  => 'objects',
					'type'    => array( 'simple', 'variable', 'variation' ),
				)
			);
			foreach ( $pinned_query as $product ) {
				$pinned_products[] = limewoo_lpl_format_product( $product );
			}
		}

		if ( $include_defaults || ! empty( $search ) ) {
			$main_query_args = array(
				'status'  => 'publish',
				'return'  => 'objects',
				'limit'   => $limit,
				'page'    => $page,
				'type'    => array( 'simple', 'variable', 'variation' ),
				'orderby' => array(
					'parent' => 'ASC',
					'title'  => 'ASC',
				),
			);

			if ( ! empty( $search ) ) {
				$main_query_args['s'] = $search;
			}

			$main_query = wc_get_products( $main_query_args );
			foreach ( $main_query as $product ) {
				if ( in_array( $product->get_id(), $product_ids, true ) ) {
					continue;
				}
				$product_list[] = limewoo_lpl_format_product( $product );
			}
		}

		return array_merge( $pinned_products, $product_list );
	}
}

if ( ! function_exists( 'limewoo_lpl_format_product' ) ) {
	/**
	 * Format a WC_Product object into a consistent array.
	 *
	 * @since 1.0.0
	 *
	 * @param WC_Product $product The product object.
	 * @return array
	 */
	function limewoo_lpl_format_product( $product ) {
		if ( ! $product instanceof WC_Product ) {
			return array();
		}

		$image_id = $product->get_image_id();

		return array(
			'id'            => $product->get_id(),
			'parent_id'     => $product->get_parent_id(),
			'name'          => $product->get_name(),
			'type'          => $product->get_type(),
			'price'         => $product->get_price(),
			'price_html'    => $product->get_price_html(),
			'permalink'     => $product->get_permalink(),
			'thumbnail_url' => $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : wc_placeholder_img_src(),
			'thumbnail'     => $product->get_image( 'woocommerce_gallery_thumbnail' ),
		);
	}
}

if ( ! function_exists( 'limewoo_lpl_get_taxonomies' ) ) {
	/**
	 * Retrieves a list of taxonomy terms.
	 *
	 * @since 1.0.0
	 *
	 * @param array $args {
	 *     Optional. Array of arguments.
	 *
	 *     @type string $taxonomy         The taxonomy to query (e.g., 'product_cat', or aliases 'categories', 'tags').
	 *     @type int[]  $term_ids         Term IDs to pin at the top.
	 *     @type string $search           A search string to filter terms.
	 *     @type int    $page             Page number for pagination.
	 *     @type int    $limit            Terms per page.
	 *     @type bool   $include_defaults Whether to include the paginated list.
	 * }
	 * @return array
	 */
	function limewoo_lpl_get_taxonomies( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'taxonomy'         => '',
				'term_ids'         => array(),
				'search'           => '',
				'page'             => 1,
				'limit'            => 20,
				'include_defaults' => false,
			)
		);

		$term_ids = array_filter( array_map( 'absint', (array) $args['term_ids'] ) );
		$search   = sanitize_text_field( $args['search'] );
		$limit    = absint( $args['limit'] );
		$page     = absint( $args['page'] );

		$taxonomy_map = array(
			'categories' => 'product_cat',
			'tags'       => 'product_tag',
			'brands'     => 'product_brand',
		);

		$taxonomy = $taxonomy_map[ $args['taxonomy'] ] ?? $args['taxonomy'];

		if ( ! taxonomy_exists( $taxonomy ) ) {
			return array();
		}

		$final_terms = array();

		if ( ! empty( $term_ids ) ) {
			$included_terms = get_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
					'include'    => $term_ids,
					'orderby'    => 'include',
				)
			);
			if ( ! is_wp_error( $included_terms ) ) {
				$final_terms = array_merge( $final_terms, $included_terms );
			}
		}

		if ( ! empty( $search ) || ! empty( $args['include_defaults'] ) ) {
			$query_args = array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'number'     => $limit,
				'offset'     => ( $page - 1 ) * $limit,
			);

			if ( ! empty( $search ) ) {
				$query_args['search'] = $search;
			}

			$list_terms = get_terms( $query_args );
			if ( ! is_wp_error( $list_terms ) ) {
				$final_terms = array_merge( $final_terms, $list_terms );
			}
		}

		if ( empty( $final_terms ) ) {
			return array();
		}

		$results_keyed = array();
		foreach ( $final_terms as $term ) {
			if ( $term instanceof WP_Term ) {
				$results_keyed[ $term->term_id ] = array(
					'id'   => $term->term_id,
					'name' => $term->name,
				);
			}
		}

		return array_values( $results_keyed );
	}
}

if ( ! function_exists( 'limewoo_lpl_get_users' ) ) {
	/**
	 * Retrieves a list of WordPress users.
	 *
	 * @since 1.0.0
	 *
	 * @param array $args {
	 *     Optional. Array of arguments.
	 *
	 *     @type string $search           A search string to filter users.
	 *     @type int[]  $user_ids         User IDs to pin at the top.
	 *     @type int    $limit            Users per page.
	 *     @type int    $page             Page number for pagination.
	 *     @type bool   $include_defaults Whether to include the paginated list.
	 * }
	 * @return array
	 */
	function limewoo_lpl_get_users( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'search'           => '',
				'user_ids'         => array(),
				'limit'            => 20,
				'page'             => 1,
				'include_defaults' => false,
			)
		);

		$user_ids         = array_filter( array_map( 'absint', (array) $args['user_ids'] ) );
		$limit            = absint( $args['limit'] );
		$page             = absint( $args['page'] );
		$search           = sanitize_text_field( $args['search'] );
		$include_defaults = (bool) $args['include_defaults'];

		$pinned_users = array();
		$user_list    = array();

		if ( ! empty( $user_ids ) ) {
			$id_query = new WP_User_Query(
				array(
					'include' => $user_ids,
					'orderby' => 'include',
				)
			);
			foreach ( $id_query->get_results() as $user ) {
				$pinned_users[] = limewoo_lpl_format_user( $user );
			}
		}

		if ( $include_defaults || ! empty( $search ) ) {
			$main_query_args = array(
				'number'  => $limit,
				'offset'  => ( $page - 1 ) * $limit,
				'orderby' => 'display_name',
				'order'   => 'ASC',
			);

			if ( ! empty( $search ) ) {
				$main_query_args['search']         = '*' . esc_attr( $search ) . '*';
				$main_query_args['search_columns'] = array( 'user_login', 'user_nicename', 'user_email', 'display_name' );
			}

			$main_query = new WP_User_Query( $main_query_args );
			foreach ( $main_query->get_results() as $user ) {
				if ( in_array( $user->ID, $user_ids, true ) ) {
					continue;
				}
				$user_list[] = limewoo_lpl_format_user( $user );
			}
		}

		return array_merge( $pinned_users, $user_list );
	}
}

if ( ! function_exists( 'limewoo_lpl_format_user' ) ) {
	/**
	 * Format a WP_User object into a consistent array.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_User $user The user object.
	 * @return array
	 */
	function limewoo_lpl_format_user( $user ) {
		if ( ! $user instanceof WP_User ) {
			return array();
		}

		return array(
			'id'   => $user->ID,
			'name' => $user->display_name,
		);
	}
}

if ( ! function_exists( 'limewoo_lpl_get_user_roles' ) ) {
	/**
	 * Retrieves a list of WordPress user roles.
	 *
	 * @since 1.0.0
	 *
	 * @param array $args {
	 *     Optional. Array of arguments.
	 *
	 *     @type string[] $role_names       Role IDs to pin at the top.
	 *     @type string   $search           A search string to filter roles.
	 *     @type int      $limit            Roles per page.
	 *     @type int      $page             Page number for pagination.
	 *     @type bool     $include_defaults Whether to include the paginated list.
	 * }
	 * @return array
	 */
	function limewoo_lpl_get_user_roles( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'role_names'       => array(),
				'search'           => '',
				'limit'            => 20,
				'page'             => 1,
				'include_defaults' => false,
			)
		);

		$role_names       = array_filter( array_map( 'sanitize_key', (array) $args['role_names'] ) );
		$limit            = absint( $args['limit'] );
		$page             = absint( $args['page'] );
		$search           = sanitize_text_field( $args['search'] );
		$include_defaults = (bool) $args['include_defaults'];

		if ( ! function_exists( 'get_editable_roles' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}
		$all_roles = get_editable_roles();

		$pinned_roles    = array();
		$paginated_roles = array();
		$role_pool       = array();

		foreach ( $all_roles as $role_id => $role_info ) {
			if ( in_array( $role_id, $role_names, true ) ) {
				$pinned_roles[ $role_id ] = $role_info;
			} else {
				$role_pool[ $role_id ] = $role_info;
			}
		}

		if ( $include_defaults || ! empty( $search ) ) {
			if ( ! empty( $search ) ) {
				$role_pool = array_filter(
					$role_pool,
					function ( $role_info ) use ( $search ) {
						return stripos( $role_info['name'], $search ) !== false;
					}
				);
			}

			$offset          = ( $page - 1 ) * $limit;
			$paginated_roles = array_slice( $role_pool, $offset, $limit, true );
		}

		$final_roles = array();

		foreach ( $pinned_roles as $role_id => $role_info ) {
			$final_roles[] = limewoo_lpl_format_user_role( $role_id, $role_info );
		}

		foreach ( $paginated_roles as $role_id => $role_info ) {
			$final_roles[] = limewoo_lpl_format_user_role( $role_id, $role_info );
		}

		return $final_roles;
	}
}

if ( ! function_exists( 'limewoo_lpl_format_user_role' ) ) {
	/**
	 * Format a user role into a consistent array.
	 *
	 * @since 1.0.0
	 *
	 * @param string $role_id   The role identifier.
	 * @param array  $role_info The role details.
	 * @return array
	 */
	function limewoo_lpl_format_user_role( $role_id, $role_info ) {
		return array(
			'id'   => $role_id,
			'name' => $role_info['name'],
		);
	}
}

if ( ! function_exists( 'limewoo_lpl_get_coupons' ) ) {
	/**
	 * Retrieves a list of WooCommerce coupons.
	 *
	 * @since 1.0.0
	 *
	 * @param array $args {
	 *     Optional. Array of arguments.
	 *
	 *     @type int[]  $coupon_ids       Coupon IDs to pin at the top.
	 *     @type int    $limit            Coupons per page.
	 *     @type int    $page             Page number for pagination.
	 *     @type string $search           A search string to filter coupons.
	 *     @type bool   $include_defaults Whether to include the paginated list.
	 * }
	 * @return array
	 */
	function limewoo_lpl_get_coupons( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'coupon_ids'       => array(),
				'limit'            => 20,
				'page'             => 1,
				'search'           => '',
				'include_defaults' => false,
			)
		);

		$coupon_ids       = array_filter( array_map( 'absint', (array) $args['coupon_ids'] ) );
		$limit            = absint( $args['limit'] );
		$page             = absint( $args['page'] );
		$search           = sanitize_text_field( $args['search'] );
		$include_defaults = (bool) $args['include_defaults'];

		$pinned_coupons = array();
		$coupon_list    = array();

		if ( ! empty( $coupon_ids ) ) {
			$pinned_posts = get_posts(
				array(
					'post_type'      => 'shop_coupon',
					'post_status'    => 'publish',
					'post__in'       => $coupon_ids,
					'orderby'        => 'post__in',
					'posts_per_page' => -1,
				)
			);
			foreach ( $pinned_posts as $coupon_post ) {
				$pinned_coupons[] = limewoo_lpl_format_coupon( $coupon_post );
			}
		}

		if ( $include_defaults || ! empty( $search ) ) {
			$main_query_args = array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'publish',
				'posts_per_page' => $limit,
				'orderby'        => 'title',
				'order'          => 'ASC',
				'offset'         => ( $page - 1 ) * $limit,
			);

			if ( ! empty( $search ) ) {
				$main_query_args['s'] = $search;
			}

			$main_list_posts = get_posts( $main_query_args );
			foreach ( $main_list_posts as $coupon_post ) {
				if ( in_array( $coupon_post->ID, $coupon_ids, true ) ) {
					continue;
				}
				$coupon_list[] = limewoo_lpl_format_coupon( $coupon_post );
			}
		}

		return array_merge( $pinned_coupons, $coupon_list );
	}
}

if ( ! function_exists( 'limewoo_lpl_format_coupon' ) ) {
	/**
	 * Format a coupon WP_Post object into a consistent array.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Post $coupon_post The coupon post object.
	 * @return array
	 */
	function limewoo_lpl_format_coupon( $coupon_post ) {
		if ( ! $coupon_post instanceof WP_Post ) {
			return array();
		}

		return array(
			'id'   => $coupon_post->ID,
			'name' => $coupon_post->post_title,
		);
	}
}

if ( ! function_exists( 'limewoo_lpl_data_signature' ) ) {
	/**
	 * Generate a SHA-256 integrity signature for export data.
	 *
	 * @since 1.0.0
	 *
	 * @param array $data Data to sign (signature key is stripped before hashing).
	 * @return string
	 */
	function limewoo_lpl_data_signature( $data ) {
		if ( isset( $data['signature'] ) ) {
			unset( $data['signature'] );
		}

		$string = wp_json_encode( $data );
		return hash( 'sha256', $string );
	}
}
