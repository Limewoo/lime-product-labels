<?php
/**
 * Label repository for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Labels;

defined( 'ABSPATH' ) || exit;

/**
 * Class LabelRepository
 *
 * Handles all DB operations for labels stored in wp_lime_product_labels.
 */
class LabelRepository {

	/**
	 * Cache version option key.
	 */
	const CACHE_VERSION_KEY = 'limewoo_lpl_labels_cache_v';

	/**
	 * Get paginated labels for the admin list.
	 *
	 * @since 1.0.0
	 *
	 * @param int    $page     Page number (1-based).
	 * @param int    $per_page Items per page.
	 * @param string $search   Optional search string matched against name.
	 * @param string $status   'all', 'active', or 'inactive'.
	 * @return array { labels: array[], total: int, pages: int, page: int, per_page: int }
	 */
	public static function get_paginated( int $page = 1, int $per_page = 20, string $search = '', string $status = 'all' ) : array {
		global $wpdb;

		$table  = $wpdb->prefix . LWPL_LABELS_TABLE; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- value is from a plugin constant, not user input.
		$page   = max( 1, $page );
		$offset = ( $page - 1 ) * $per_page;

		$where  = array( '1=1' );
		$params = array();

		if ( 'all' !== $status && in_array( $status, array( 'active', 'inactive' ), true ) ) {
			$where[]  = 'status = %s';
			$params[] = $status;
		}

		if ( ! empty( $search ) ) {
			$where[]  = 'name LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $search ) . '%';
		}

		$where_sql = implode( ' AND ', $where );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is from plugin constant; $where_sql uses %s placeholders
		$count_sql = "SELECT COUNT(*) FROM $table WHERE $where_sql";
		$total     = (int) ( empty( $params ) ? $wpdb->get_var( $count_sql ) : $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) ); // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

		$limit_params = array_merge( $params, array( $per_page, $offset ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is from plugin constant; $where_sql uses %s placeholders
		$rows_sql = "SELECT label_id, data FROM $table WHERE $where_sql ORDER BY sort_order ASC, id ASC LIMIT %d OFFSET %d";

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$rows = $wpdb->get_results( $wpdb->prepare( $rows_sql, $limit_params ), ARRAY_A );

		$labels = array();
		foreach ( (array) $rows as $row ) {
			$decoded = json_decode( $row['data'], true );
			if ( is_array( $decoded ) ) {
				$labels[] = $decoded;
			}
		}

		return array(
			'labels'   => $labels,
			'total'    => $total,
			'pages'    => (int) ceil( $total / $per_page ),
			'page'     => $page,
			'per_page' => $per_page,
		);
	}

	/**
	 * Get all active labels ordered by sort_order.
	 * Results are version-keyed transient cached.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public static function get_active_labels() : array {
		$version       = (int) get_option( self::CACHE_VERSION_KEY, 0 );
		$transient_key = 'lwpl_active_labels_v' . $version;
		$cached        = get_transient( $transient_key );

		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		$table = $wpdb->prefix . LWPL_LABELS_TABLE; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- value is from a plugin constant, not user input.

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is from plugin constant
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT data FROM $table WHERE status = %s ORDER BY sort_order ASC, id ASC", 'active' ), ARRAY_A );

		$labels = array();
		foreach ( (array) $rows as $row ) {
			$decoded = json_decode( $row['data'], true );
			if ( is_array( $decoded ) ) {
				$labels[] = $decoded;
			}
		}

		set_transient( $transient_key, $labels, DAY_IN_SECONDS );

		return $labels;
	}

	/**
	 * Get a single label by label_id (UUID).
	 *
	 * @since 1.0.0
	 *
	 * @param string $label_id UUID.
	 * @return array|null
	 */
	public static function get_by_id( string $label_id ) : ?array {
		global $wpdb;

		$table = $wpdb->prefix . LWPL_LABELS_TABLE; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- value is from a plugin constant, not user input.

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is from plugin constant
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT data FROM $table WHERE label_id = %s LIMIT 1", $label_id ), ARRAY_A );

		if ( ! $row ) {
			return null;
		}

		$decoded = json_decode( $row['data'], true );

		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Create a new label row.
	 *
	 * @since 1.0.0
	 *
	 * @param array $label Full label data array (must include 'id' UUID).
	 * @return string|\WP_Error label_id on success, WP_Error on failure.
	 */
	public static function create( array $label ) : string|\WP_Error {
		global $wpdb;

		$label_id = sanitize_text_field( $label['id'] ?? '' );

		if ( empty( $label_id ) ) {
			return new \WP_Error( 'missing_id', esc_html__( 'Label ID is required.', 'lime-product-labels' ) );
		}

		$table      = $wpdb->prefix . LWPL_LABELS_TABLE;
		$sort_order = self::get_next_sort_order();

		$inserted = $wpdb->insert(
			$table,
			array(
				'label_id'   => $label_id,
				'name'       => sanitize_text_field( $label['name'] ?? '' ),
				'status'     => in_array( $label['status'] ?? 'active', array( 'active', 'inactive' ), true ) ? $label['status'] : 'active',
				'sort_order' => $sort_order,
				'data'       => wp_json_encode( $label ),
			),
			array( '%s', '%s', '%s', '%d', '%s' )
		);

		if ( false === $inserted ) {
			return new \WP_Error( 'db_error', esc_html__( 'Failed to create label.', 'lime-product-labels' ) );
		}

		self::bump_cache_version();

		return $label_id;
	}

	/**
	 * Update an existing label row by label_id.
	 *
	 * @since 1.0.0
	 *
	 * @param string $label_id UUID.
	 * @param array  $label    Full updated label data.
	 * @return bool|\WP_Error
	 */
	public static function update( string $label_id, array $label ) : bool|\WP_Error {
		global $wpdb;

		$table = $wpdb->prefix . LWPL_LABELS_TABLE;

		$updated = $wpdb->update(
			$table,
			array(
				'name'   => sanitize_text_field( $label['name'] ?? '' ),
				'status' => in_array( $label['status'] ?? 'active', array( 'active', 'inactive' ), true ) ? $label['status'] : 'active',
				'data'   => wp_json_encode( $label ),
			),
			array( 'label_id' => $label_id ),
			array( '%s', '%s', '%s' ),
			array( '%s' )
		);

		if ( false === $updated ) {
			return new \WP_Error( 'db_error', esc_html__( 'Failed to update label.', 'lime-product-labels' ) );
		}

		self::bump_cache_version();

		return true;
	}

	/**
	 * Delete a label row by label_id.
	 *
	 * @since 1.0.0
	 *
	 * @param string $label_id UUID.
	 * @return bool
	 */
	public static function delete( string $label_id ) : bool {
		global $wpdb;

		$table  = $wpdb->prefix . LWPL_LABELS_TABLE;
		$result = $wpdb->delete( $table, array( 'label_id' => $label_id ), array( '%s' ) );

		if ( false !== $result ) {
			self::bump_cache_version();
		}

		return false !== $result;
	}

	/**
	 * Bulk update sort_order based on an ordered list of label_ids.
	 *
	 * @since 1.0.0
	 *
	 * @param array $label_ids Ordered array of label_id UUIDs.
	 * @return bool
	 */
	public static function reorder( array $label_ids ) : bool {
		global $wpdb;

		$table = $wpdb->prefix . LWPL_LABELS_TABLE;

		foreach ( $label_ids as $index => $label_id ) {
			$wpdb->update(
				$table,
				array( 'sort_order' => $index ),
				array( 'label_id' => sanitize_text_field( $label_id ) ),
				array( '%d' ),
				array( '%s' )
			);
		}

		self::bump_cache_version();

		return true;
	}

	/**
	 * Get all labels (for admin export).
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public static function get_all() : array {
		global $wpdb;

		$table = $wpdb->prefix . LWPL_LABELS_TABLE; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- value is from a plugin constant, not user input.

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is from plugin constant
		$rows = $wpdb->get_results( "SELECT data FROM $table ORDER BY sort_order ASC, id ASC", ARRAY_A );

		$labels = array();
		foreach ( (array) $rows as $row ) {
			$decoded = json_decode( $row['data'], true );
			if ( is_array( $decoded ) ) {
				$labels[] = $decoded;
			}
		}

		return $labels;
	}

	/**
	 * Get the next sort_order value (max + 1).
	 *
	 * @since 1.0.0
	 *
	 * @return int
	 */
	private static function get_next_sort_order() : int {
		global $wpdb;

		$table = $wpdb->prefix . LWPL_LABELS_TABLE; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- value is from a plugin constant, not user input.

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is from plugin constant
		$max = $wpdb->get_var( "SELECT MAX(sort_order) FROM $table" );

		return is_null( $max ) ? 0 : (int) $max + 1;
	}

	/**
	 * Bump the cache version to invalidate all active_labels transients.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function bump_cache_version() : void {
		$version = (int) get_option( self::CACHE_VERSION_KEY, 0 );
		update_option( self::CACHE_VERSION_KEY, $version + 1, false );
	}
}
