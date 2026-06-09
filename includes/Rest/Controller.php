<?php
/**
 * REST API for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Rest;

use LimeProductLabels\Fields\Fields;
use LimeProductLabels\Labels\LabelRepository;
use LimeProductLabels\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Class Controller
 *
 * Manages REST API endpoints for Lime Product Labels.
 */
class Controller {
	use Singleton;

	/**
	 * REST API namespace.
	 */
	const API_NAMESPACE = 'lime_product_labels/v1';

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_settings' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register settings for Lime Product Labels.
	 *
	 * @since 1.0.0
	 */
	public function register_settings() {
		$schema = array(
			'type'       => 'object',
			'properties' => array(
				'styles'   => array(
					'type'                 => 'object',
					'properties'           => $this->get_fields_schema( 'styles' ),
					'additionalProperties' => true,
				),
				'settings' => array(
					'type'                 => 'object',
					'properties'           => $this->get_fields_schema( 'settings' ),
					'additionalProperties' => true,
				),
			),
		);

		register_setting(
			'options',
			LWPL_OPTION_KEY,
			array(
				'type'              => 'object',
				'default'           => self::get_default_options(),
				'sanitize_callback' => array( $this, 'sanitize_options' ),
				'show_in_rest'      => array(
					'schema' => $schema,
				),
			)
		);
	}

	/**
	 * Get default options structure.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	private static function get_default_options() {
		return array(
			'styles'   => (object) array(),
			'settings' => (object) array(),
		);
	}

	/**
	 * Get schema for a field group set.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key Field group key.
	 * @return array
	 */
	private function get_fields_schema( $key ) {
		$schema = array();
		$groups = Fields::get_all_fields( $key );

		if ( empty( $groups ) || ! is_array( $groups ) ) {
			return $schema;
		}

		foreach ( $groups as $group ) {
			if ( empty( $group['fields'] ) || ! is_array( $group['fields'] ) ) {
				continue;
			}

			foreach ( $group['fields'] as $field ) {
				$this->collect_field_schema( $field, $schema );
			}
		}

		return $schema;
	}

	/**
	 * Collect schema from a field, including nested group fields.
	 *
	 * @since 1.0.0
	 *
	 * @param array $field  Field definition.
	 * @param array $schema Schema array to populate.
	 */
	private function collect_field_schema( $field, &$schema ) {
		if ( isset( $field['id'], $field['schema'] ) ) {
			$schema[ $field['id'] ] = $field['schema'];
		}

		if ( isset( $field['type'], $field['fields'] ) && 'group' === $field['type'] && is_array( $field['fields'] ) ) {
			foreach ( $field['fields'] as $sub_field ) {
				$this->collect_field_schema( $sub_field, $schema );
			}
		}
	}

	/**
	 * Register REST API routes.
	 *
	 * @since 1.0.0
	 */
	public function register_rest_routes() {
		// Public-facing routes (nonce required).
		register_rest_route(
			self::API_NAMESPACE,
			'/options',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'options_rest_handler' ),
				'permission_callback' => array( $this, 'public_permissions_check' ),
			)
		);

		// Admin-only data endpoints.
		$admin_routes = array(
			'products'   => array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => 'products_rest_handler',
			),
			'taxonomies' => array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => 'taxonomies_rest_handler',
			),
			'users'      => array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => 'users_rest_handler',
			),
			'user_roles' => array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => 'user_roles_rest_handler',
			),
			'coupons'    => array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => 'coupons_rest_handler',
			),
			'labels'     => array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => 'get_labels_handler',
			),
		);

		foreach ( $admin_routes as $endpoint => $config ) {
			register_rest_route(
				self::API_NAMESPACE,
				'/' . $endpoint,
				array(
					'methods'             => $config['methods'],
					'callback'            => array( $this, $config['callback'] ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				)
			);
		}

		// Label CRUD — POST (create).
		register_rest_route(
			self::API_NAMESPACE,
			'/labels',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_label_handler' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);

		// Label export.
		register_rest_route(
			self::API_NAMESPACE,
			'/labels/export',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'export_labels_handler' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);

		// Label import.
		register_rest_route(
			self::API_NAMESPACE,
			'/labels/import',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'import_labels_handler' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			)
		);

		// Label reorder.
		register_rest_route(
			self::API_NAMESPACE,
			'/labels/reorder',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'reorder_labels_handler' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
				'args'                => array(
					'label_ids' => array(
						'required' => true,
						'type'     => 'array',
					),
				),
			)
		);

		// Label GET/PUT/DELETE by label_id.
		register_rest_route(
			self::API_NAMESPACE,
			'/labels/(?P<label_id>[\w\-]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_label_handler' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_label_handler' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_label_handler' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Admin permission check.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function admin_permissions_check( \WP_REST_Request $request ) {
		return current_user_can( 'manage_options' ) && wp_verify_nonce( $request->get_header( 'X-WP-Nonce' ), 'wp_rest' );
	}

	/**
	 * Public permission check (nonce required).
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function public_permissions_check( \WP_REST_Request $request ) {
		return wp_verify_nonce( $request->get_header( 'X-WP-Nonce' ), 'wp_rest' );
	}

	/**
	 * GET /options — return plugin options for the storefront.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function options_rest_handler( \WP_REST_Request $request ) {
		$data           = limewoo_lpl_get_option_data();
		$data['labels'] = LabelRepository::get_active_labels();

		return rest_ensure_response( $data );
	}

	/**
	 * GET /products — product search for admin UI.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function products_rest_handler( \WP_REST_Request $request ) {
		$search      = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$product_ids = array_map( 'absint', (array) ( $request->get_param( 'product_ids' ) ?? array() ) );
		$page        = absint( $request->get_param( 'page' ) ?? 1 );
		$limit       = max( 1, absint( $request->get_param( 'limit' ) ?? 20 ) );

		add_filter( 'woocommerce_product_variation_title_include_attributes', '__return_true' );

		$products = limewoo_lpl_get_products(
			array(
				'search'           => $search,
				'product_ids'      => $product_ids,
				'page'             => $page,
				'limit'            => $limit,
				'include_defaults' => true,
			)
		);

		remove_filter( 'woocommerce_product_variation_title_include_attributes', '__return_true' );

		return rest_ensure_response( $products );
	}

	/**
	 * GET /taxonomies — taxonomy term search for admin UI.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function taxonomies_rest_handler( \WP_REST_Request $request ) {
		$taxonomy = sanitize_key( $request->get_param( 'taxonomy' ) ?? '' );
		$term_ids = array_map( 'absint', (array) ( $request->get_param( 'term_ids' ) ?? array() ) );
		$search   = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$page     = absint( $request->get_param( 'page' ) ?? 1 );
		$limit    = absint( $request->get_param( 'limit' ) ?? 20 );

		$terms = limewoo_lpl_get_taxonomies(
			array(
				'taxonomy'         => $taxonomy,
				'term_ids'         => $term_ids,
				'search'           => $search,
				'page'             => $page,
				'limit'            => $limit,
				'include_defaults' => true,
			)
		);

		return rest_ensure_response( $terms );
	}

	/**
	 * GET /users — user search for admin UI.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function users_rest_handler( \WP_REST_Request $request ) {
		$user_ids = array_map( 'absint', (array) ( $request->get_param( 'user_ids' ) ?? array() ) );
		$search   = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$page     = absint( $request->get_param( 'page' ) ?? 1 );
		$limit    = absint( $request->get_param( 'limit' ) ?? 20 );

		$users = limewoo_lpl_get_users(
			array(
				'user_ids'         => $user_ids,
				'search'           => $search,
				'page'             => $page,
				'limit'            => $limit,
				'include_defaults' => true,
			)
		);

		return rest_ensure_response( $users );
	}

	/**
	 * GET /user_roles — user role list for admin UI.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function user_roles_rest_handler( \WP_REST_Request $request ) {
		$role_names = array_map( 'sanitize_key', (array) ( $request->get_param( 'role_names' ) ?? array() ) );
		$search     = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$page       = absint( $request->get_param( 'page' ) ?? 1 );
		$limit      = absint( $request->get_param( 'limit' ) ?? 20 );

		$roles = limewoo_lpl_get_user_roles(
			array(
				'role_names'       => $role_names,
				'search'           => $search,
				'page'             => $page,
				'limit'            => $limit,
				'include_defaults' => true,
			)
		);

		return rest_ensure_response( $roles );
	}

	/**
	 * GET /coupons — coupon search for admin UI.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function coupons_rest_handler( \WP_REST_Request $request ) {
		$coupon_ids = array_map( 'absint', (array) ( $request->get_param( 'coupon_ids' ) ?? array() ) );
		$search     = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$page       = absint( $request->get_param( 'page' ) ?? 1 );
		$limit      = absint( $request->get_param( 'limit' ) ?? 20 );

		$coupons = limewoo_lpl_get_coupons(
			array(
				'coupon_ids'       => $coupon_ids,
				'search'           => $search,
				'page'             => $page,
				'limit'            => $limit,
				'include_defaults' => true,
			)
		);

		return rest_ensure_response( $coupons );
	}

	/**
	 * GET /labels — paginated label list.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function get_labels_handler( \WP_REST_Request $request ) {
		$page     = absint( $request->get_param( 'page' ) ?? 1 );
		$per_page = min( 100, absint( $request->get_param( 'per_page' ) ?? 20 ) );
		$search   = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$status   = sanitize_key( $request->get_param( 'status' ) ?? 'all' );

		if ( ! in_array( $status, array( 'all', 'active', 'inactive' ), true ) ) {
			$status = 'all';
		}

		return rest_ensure_response( array(
			'success' => true,
			'data'    => LabelRepository::get_paginated( $page, $per_page, $search, $status ),
		) );
	}

	/**
	 * GET /labels/{label_id} — single label.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_label_handler( \WP_REST_Request $request ) {
		$label_id = sanitize_text_field( $request->get_param( 'label_id' ) );
		$label    = LabelRepository::get_by_id( $label_id );

		if ( null === $label ) {
			return new \WP_Error( 'not_found', esc_html__( 'Label not found.', 'lime-product-labels' ), array( 'status' => 404 ) );
		}

		return rest_ensure_response( $label );
	}

	/**
	 * POST /labels — create a new label.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function create_label_handler( \WP_REST_Request $request ) {
		$label  = $request->get_json_params();
		$result = LabelRepository::create( $label );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$created = LabelRepository::get_by_id( $result );

		return rest_ensure_response( $created );
	}

	/**
	 * PUT /labels/{label_id} — update a label.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_label_handler( \WP_REST_Request $request ) {
		$label_id = sanitize_text_field( $request->get_param( 'label_id' ) );
		$label    = $request->get_json_params();
		$result   = LabelRepository::update( $label_id, $label );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$updated = LabelRepository::get_by_id( $label_id );

		return rest_ensure_response( $updated );
	}

	/**
	 * DELETE /labels/{label_id} — delete a label.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_label_handler( \WP_REST_Request $request ) {
		$label_id = sanitize_text_field( $request->get_param( 'label_id' ) );
		$deleted  = LabelRepository::delete( $label_id );

		if ( ! $deleted ) {
			return new \WP_Error( 'delete_failed', esc_html__( 'Failed to delete label.', 'lime-product-labels' ), array( 'status' => 500 ) );
		}

		return rest_ensure_response( array( 'deleted' => true ) );
	}

	/**
	 * POST /labels/reorder — bulk update sort_order.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function reorder_labels_handler( \WP_REST_Request $request ) {
		$label_ids = array_map( 'sanitize_text_field', (array) $request->get_param( 'label_ids' ) );
		LabelRepository::reorder( $label_ids );

		return rest_ensure_response( array( 'reordered' => true ) );
	}

	/**
	 * Sanitize options before saving to the database.
	 *
	 * @since 1.0.0
	 *
	 * @param mixed $input Raw input.
	 * @return array
	 */
	public function sanitize_options( $input ) {
		if ( ! is_array( $input ) ) {
			return self::get_default_options();
		}

		$sanitized = array();

		if ( isset( $input['styles'] ) && is_array( $input['styles'] ) ) {
			$sanitized['styles'] = $this->sanitize_field_group( $input['styles'], 'styles' );
		}

		if ( isset( $input['settings'] ) && is_array( $input['settings'] ) ) {
			$sanitized['settings'] = $this->sanitize_field_group( $input['settings'], 'settings' );
		}

		return $sanitized;
	}

	/**
	 * Sanitize a field group by iterating over known field definitions.
	 *
	 * @since 1.0.0
	 *
	 * @param array  $data Field data.
	 * @param string $key  Field group key.
	 * @return array
	 */
	private function sanitize_field_group( array $data, string $key ) : array {
		$sanitized = array();
		$groups    = Fields::get_all_fields( $key );

		if ( empty( $groups ) ) {
			return $sanitized;
		}

		$flat_fields = array();
		foreach ( $groups as $group ) {
			if ( ! empty( $group['fields'] ) && is_array( $group['fields'] ) ) {
				foreach ( $group['fields'] as $field ) {
					$this->collect_flat_fields( $field, $flat_fields );
				}
			}
		}

		foreach ( $flat_fields as $field ) {
			$id = $field['id'] ?? '';
			if ( empty( $id ) || ! isset( $data[ $id ] ) ) {
				continue;
			}

			$sanitized[ $id ] = $this->sanitize_field_value( $data[ $id ], $field );
		}

		return $sanitized;
	}

	/**
	 * Flatten field definitions (handles group types recursively).
	 *
	 * @since 1.0.0
	 *
	 * @param array $field       Field definition.
	 * @param array $flat_fields Accumulator.
	 */
	private function collect_flat_fields( array $field, array &$flat_fields ) {
		if ( 'group' === ( $field['type'] ?? '' ) && ! empty( $field['fields'] ) ) {
			foreach ( $field['fields'] as $sub_field ) {
				$this->collect_flat_fields( $sub_field, $flat_fields );
			}
		} else {
			$flat_fields[] = $field;
		}
	}

	/**
	 * Sanitize a single field value based on its schema type.
	 *
	 * @since 1.0.0
	 *
	 * @param mixed $value Field value.
	 * @param array $field Field definition.
	 * @return mixed
	 */
	private function sanitize_field_value( $value, array $field ) {
		$type = $field['schema']['type'] ?? 'string';

		switch ( $type ) {
			case 'boolean':
				return (bool) $value;
			case 'number':
			case 'integer':
				return is_numeric( $value ) ? ( 'integer' === $type ? (int) $value : (float) $value ) : 0;
			case 'array':
				$items = $field['schema']['items']['type'] ?? 'string';
				if ( ! is_array( $value ) ) {
					return array();
				}
				return 'integer' === $items
					? array_map( 'intval', $value )
					: array_map( 'sanitize_text_field', $value );
			default:
				$enum = $field['schema']['enum'] ?? array();
				if ( ! empty( $enum ) && ! in_array( $value, $enum, true ) ) {
					return $field['default'] ?? '';
				}
				return sanitize_text_field( (string) $value );
		}
	}

	/**
	 * Sanitize an array of field values against field group definitions.
	 *
	 * @since 1.0.0
	 *
	 * @param array $data   Raw input data.
	 * @param array $groups Field group definitions (each group has a 'fields' key).
	 * @return array Sanitized data.
	 */
	private function sanitize_fields( $data, $groups ) {
		if ( ! is_array( $data ) ) {
			return array();
		}

		$sanitized = array();

		foreach ( $groups as $group ) {
			if ( empty( $group['fields'] ) || ! is_array( $group['fields'] ) ) {
				continue;
			}

			foreach ( $group['fields'] as $field ) {
				$sanitized = $this->sanitize_field( $field, $data, $sanitized );
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize a single field value based on its schema.
	 *
	 * @since 1.0.0
	 *
	 * @param array $field     Field definition.
	 * @param array $data      Raw input data.
	 * @param array $sanitized Running sanitized output.
	 * @return array Updated sanitized output.
	 */
	private function sanitize_field( $field, $data, $sanitized ) {
		$field_id   = $field['id'] ?? null;
		$schema     = $field['schema'] ?? null;
		$field_type = $schema['type'] ?? null;

		if ( ! $field_id || ! $schema || ! array_key_exists( $field_id, $data ) ) {
			return $sanitized;
		}

		$value = $data[ $field_id ];

		switch ( $field_type ) {
			case 'string':
				if ( isset( $schema['enum'] ) && is_array( $schema['enum'] ) ) {
					$sanitized[ $field_id ] = in_array( $value, $schema['enum'], true )
						? $value
						: ( $field['default'] ?? '' );
				} else {
					$sanitized[ $field_id ] = sanitize_text_field( $value );
				}
				break;

			case 'number':
				$sanitized[ $field_id ] = is_numeric( $value ) ? floatval( $value ) : ( $field['default'] ?? 0 );
				break;

			case 'integer':
				$sanitized[ $field_id ] = is_numeric( $value ) ? intval( $value ) : ( $field['default'] ?? 0 );
				break;

			case 'boolean':
				$sanitized[ $field_id ] = filter_var( $value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
				if ( is_null( $sanitized[ $field_id ] ) ) {
					$sanitized[ $field_id ] = $field['default'] ?? false;
				}
				break;

			case 'array':
				if ( ! is_array( $value ) ) {
					$sanitized[ $field_id ] = $field['default'] ?? array();
					break;
				}
				if ( isset( $schema['items']['type'] ) ) {
					$item_type       = $schema['items']['type'];
					$sanitized_items = array();
					foreach ( $value as $item ) {
						if ( 'integer' === $item_type ) {
							$sanitized_items[] = is_numeric( $item ) ? intval( $item ) : null;
						} elseif ( 'string' === $item_type ) {
							$sanitized_items[] = sanitize_text_field( $item );
						}
					}
					$sanitized[ $field_id ] = array_values( array_filter( $sanitized_items, fn( $item ) => $item !== null ) );
				} else {
					$sanitized[ $field_id ] = array_values( array_map( 'sanitize_text_field', $value ) );
				}
				break;
		}

		return $sanitized;
	}

	/**
	 * Handler for exporting labels.
	 *
	 * @since 1.0.0
	 *
	 * @return \WP_REST_Response
	 */
	public function export_labels_handler() {
		$labels = LabelRepository::get_all();

		if ( empty( $labels ) ) {
			return rest_ensure_response( array(
				'success' => false,
				'message' => esc_html__( 'No labels found to export.', 'lime-product-labels' ),
				'data'    => array(),
			) );
		}

		$data = array(
			'version'     => LWPL_VERSION,
			'export_date' => current_time( 'mysql', true ),
			'site_url'    => esc_url_raw( get_site_url() ),
			'labels'      => $labels,
		);

		$data['signature'] = limewoo_lpl_data_signature( $data );

		return rest_ensure_response( array(
			'success' => true,
			'file'    => sprintf(
				'lime-product-labels-%s.json',
				gmdate( 'Y-m-d-His' )
			),
			'data'    => $data,
		) );
	}

	/**
	 * Handler for importing labels.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function import_labels_handler( \WP_REST_Request $request ) {
		$file_content = $request->get_param( 'file' );

		if ( strlen( $file_content ) > 2 * MB_IN_BYTES ) {
			return new \WP_Error( 'file_too_large', esc_html__( 'Import file exceeds the 2MB limit.', 'lime-product-labels' ), array( 'status' => 413 ) );
		}

		$decoded = json_decode( $file_content, true );

		if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $decoded ) ) {
			return new \WP_Error( 'invalid_file', esc_html__( 'Invalid JSON file.', 'lime-product-labels' ), array( 'status' => 400 ) );
		}

		foreach ( array( 'version', 'export_date', 'site_url', 'labels', 'signature' ) as $key ) {
			if ( ! isset( $decoded[ $key ] ) ) {
				return new \WP_Error(
					'missing_data',
					sprintf(
						/* Translators: %s: Key */
						esc_html__( 'Missing key: %s', 'lime-product-labels' ),
						$key
					),
					array( 'status' => 400 )
				);
			}
		}

		if ( count( $decoded['labels'] ) > 500 ) {
			return new \WP_Error( 'too_many_labels', esc_html__( 'Import file contains too many labels (maximum: 500).', 'lime-product-labels' ), array( 'status' => 400 ) );
		}

		$signature = $decoded['signature'];
		unset( $decoded['signature'] );

		$expected_signature = limewoo_lpl_data_signature( $decoded );

		if ( ! hash_equals( $expected_signature, $signature ) ) {
			return new \WP_Error( 'invalid_signature', esc_html__( 'File signature is invalid.', 'lime-product-labels' ), array( 'status' => 400 ) );
		}

		$sanitized_labels = array();

		foreach ( $decoded['labels'] as $label ) {
			$sanitized_labels[] = $this->sanitize_fields( $label, Fields::get_all_fields( 'labels' ) );
		}

		$imported = LabelRepository::import_labels( $sanitized_labels );

		return rest_ensure_response( array(
			'success'  => true,
			'imported' => $imported,
			'message'  => sprintf(
				/* Translators: %d: number of labels imported */
				esc_html__( '%d label(s) imported.', 'lime-product-labels' ),
				$imported
			),
		) );
	}
}
