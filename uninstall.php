<?php
/**
 * Uninstall Lime Product Labels
 *
 * Runs when the user deletes the plugin from the WordPress admin.
 * Only deletes data if the user has explicitly opted in via the plugin settings.
 *
 * @package lime-product-labels
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

$options = get_option( 'lime_product_labels' );

if ( ! empty( $options['settings']['delete_data_on_uninstall'] ) ) {
	global $wpdb;

	// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- %i identifier placeholder requires WP 6.2+.
	$wpdb->query( $wpdb->prepare( 'DROP TABLE IF EXISTS %i', $wpdb->prefix . 'lime_product_labels' ) );

	delete_option( 'lime_product_labels' );
	delete_option( 'lime_product_labels_version' );
	delete_option( 'lime_product_labels_installed' );
	delete_option( 'limewoo_lpl_labels_cache_v' );

	// Per-product transients.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- No WP API for wildcard transient deletion; one-time uninstall op.
	$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '\_transient\_lpl\_p\_%' OR option_name LIKE '\_transient\_timeout\_lpl\_p\_%'" );
}
