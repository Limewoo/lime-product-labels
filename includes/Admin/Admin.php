<?php
/**
 * Admin functionality for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Admin;

use LimeProductLabels\Rest\Controller;
use LimeProductLabels\Fields\Fields;
use LimeProductLabels\Traits\Singleton;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Class Admin
 */
class Admin {
	use Singleton;

	/**
	 * Initializes admin hooks.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		if ( ! is_admin() ) {
			return;
		}

		Menu::get_instance();

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueues admin scripts & styles.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( ! in_array( $hook, array( 'toplevel_page_' . Menu::MENU_SLUG ), true ) ) {
			return;
		}

		$asset_file = LPL_PLUGIN_PATH . 'build/admin/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_style(
			'lime-product-labels-admin',
			LPL_BUILD_URL . 'admin/index.css',
			array_filter(
				$asset['dependencies'],
				function ( $style ) {
					return wp_style_is( $style, 'registered' );
				}
			),
			$asset['version'],
		);

		wp_enqueue_script(
			'lime-product-labels-admin',
			LPL_BUILD_URL . 'admin/index.js',
			$asset['dependencies'],
			$asset['version'],
			array(
				'in_footer' => true,
			)
		);

		$obj = array(
			'version'       => LPL_VERSION,
			'rest_path'     => esc_attr( '/wp/v2/settings' ),
			'api_namespace' => esc_attr( Controller::API_NAMESPACE ),
			'ajax_url'      => admin_url( 'admin-ajax.php' ),
			'rest_nonce'    => wp_create_nonce( 'wp_rest' ),
			'option'        => LPL_OPTION_KEY,
			'fields'        => Fields::get_all_fields(),
		);

		/**
		 * Filter localized data for the admin script.
		 *
		 * @since 1.0.0
		 *
		 * @param array $obj Localized data.
		 */
		$localized_data = apply_filters( 'limewoo_lpl_localized_data_admin', $obj );

		wp_localize_script(
			'lime-product-labels-admin',
			'LimeProductLabels',
			$localized_data,
		);

		wp_set_script_translations( 'lime-product-labels-admin', 'lime-product-labels', LPL_PLUGIN_PATH . 'languages' );
	}
}
