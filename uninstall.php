<?php
/**
 * Uninstall Lime Product Labels
 *
 * @package lime-product-labels
 */

// Exit if not called from WordPress uninstall.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;

// Drop the labels table.
$table = $wpdb->prefix . 'lime_product_labels';
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- dropping plugin table on uninstall; value is from a hardcoded constant.
$wpdb->query( "DROP TABLE IF EXISTS $table" );

// Remove plugin options.
delete_option( 'lime_product_labels' );
delete_option( 'lime_product_labels_version' );
delete_option( 'lime_product_labels_installed' );
delete_option( 'limewoo_lpl_labels_cache_v' );
