<?php
/**
 * Installation-related functions.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels;

defined( 'ABSPATH' ) || exit;

/**
 * Class Install
 *
 * Handles plugin activation tasks such as creating database tables.
 */
class Install {
	/**
	 * Run activation tasks.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function activate() {
		self::create_tables();

		update_option( LWPL_OPTION_KEY . '_version', LWPL_VERSION );

		add_option( LWPL_OPTION_KEY . '_installed', time() );
	}

	/**
	 * Clean up on deactivation.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function deactivate() {
		// Nothing to schedule/unschedule for this free plugin.
	}

	/**
	 * Create custom database tables.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		$labels_table = $wpdb->prefix . LWPL_LABELS_TABLE; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- value is from a plugin constant, not user input.

		$sql = "CREATE TABLE $labels_table (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			label_id VARCHAR(36) NOT NULL,
			name VARCHAR(255) NOT NULL DEFAULT '',
			status VARCHAR(20) NOT NULL DEFAULT 'active',
			sort_order INT UNSIGNED NOT NULL DEFAULT 0,
			data LONGTEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY uq_label_id (label_id),
			INDEX idx_status (status),
			INDEX idx_sort_order (sort_order)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		dbDelta( $sql );
	}
}
