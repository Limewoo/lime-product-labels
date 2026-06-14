<?php
/**
 * Plugin Name:           Lime Product Labels
 * Plugin URI:            https://limewoo.com/product-labels
 * Description:           Add visual badge labels to WooCommerce product images (e.g. New, Sale, Hot).
 * Version:               1.0.0
 * Author:                Limewoo
 * Author URI:            https://limewoo.com
 * Developer:             Limewoo
 * Developer URI:         https://limewoo.com
 * License:               GPL-2.0-or-later
 * License URI:           https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:           lime-product-labels
 * Domain Path:           /languages
 * Requires at least:     6.5
 * Tested up to:          7.0
 * Requires Plugins:      woocommerce
 * WC requires at least:  8.0
 * WC tested up to:       10.8
 * Requires PHP:          8.0
 *
 * @package lime-product-labels
 */

use Automattic\WooCommerce\Utilities\FeaturesUtil;
use LimeProductLabels\Admin\Admin;
use LimeProductLabels\Rest\Controller;
use LimeProductLabels\Frontend\Frontend;
use LimeProductLabels\Traits\Singleton;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Composer autoloader
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
} else {
	add_action( 'admin_notices', function () {
		?>
		<div class="error">
			<p>
				<?php
				printf(
					// translators: %s: Composer install command wrapped in <code> tag.
					esc_html__( 'Lime Product Labels: Please run %s to generate the autoloader.', 'lime-product-labels' ),
					'<code>composer install</code>'
				);
				?>
			</p>
		</div>
		<?php
	} );
	return;
}

// Define constants.
if ( ! defined( 'LPL_VERSION' ) ) {
	define( 'LPL_VERSION', '1.0.0' );
}

if ( ! defined( 'LPL_PLUGIN_FILE' ) ) {
	define( 'LPL_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'LPL_PLUGIN_PATH' ) ) {
	define( 'LPL_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'LPL_WOO_SLUG' ) ) {
	define( 'LPL_WOO_SLUG', basename( LPL_PLUGIN_PATH ) );
}

if ( ! defined( 'LPL_PLUGIN_BASENAME' ) ) {
	define( 'LPL_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
}

if ( ! defined( 'LPL_PLUGIN_URL' ) ) {
	define( 'LPL_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

if ( ! defined( 'LPL_BUILD_URL' ) ) {
	define( 'LPL_BUILD_URL', LPL_PLUGIN_URL . 'build/' );
}

if ( ! defined( 'LPL_NONCE_ACTION' ) ) {
	define( 'LPL_NONCE_ACTION', 'LPL_nonce' );
}

if ( ! defined( 'LPL_OPTION_KEY' ) ) {
	define( 'LPL_OPTION_KEY', 'lime_product_labels' );
}

if ( ! defined( 'LPL_LABELS_TABLE' ) ) {
	define( 'LPL_LABELS_TABLE', 'lime_product_labels' );
}

if ( ! defined( 'LPL_DB_VERSION' ) ) {
	define( 'LPL_DB_VERSION', '1.0' );
}

/**
 * Plugin activation/deactivation hooks.
 */
require_once LPL_PLUGIN_PATH . 'includes/Install.php';

register_activation_hook( LPL_PLUGIN_FILE, array( 'LimeProductLabels\Install', 'activate' ) );

register_deactivation_hook( LPL_PLUGIN_FILE, array( 'LimeProductLabels\Install', 'deactivate' ) );

/**
 * Main plugin class.
 */
final class LimeProductLabelsMain {
	use Singleton;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function __construct() {
		if ( $this->is_woocommerce_active() ) {
			$this->init();

			add_action( 'before_woocommerce_init', function() {
				if ( class_exists( FeaturesUtil::class ) ) {
					FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__ );
				}
			} );
		} else {
			add_action( 'admin_notices', array( $this, 'woocommerce_missing_notice' ) );
		}
	}

	/**
	 * Check if WooCommerce is active.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	private function is_woocommerce_active() {
		if ( is_multisite() && array_key_exists( 'woocommerce/woocommerce.php', get_site_option( 'active_sitewide_plugins', array() ) ) ) {
			return true;
		}

		return in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ), true );
	}

	/**
	 * Display notice if WooCommerce is not active.
	 *
	 * @since 1.0.0
	 */
	public function woocommerce_missing_notice() {
		?>
		<div class="error">
			<p><?php esc_html_e( 'Lime Product Labels requires WooCommerce to be installed and active.', 'lime-product-labels' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Initialize the plugin.
	 *
	 * @since 1.0.0
	 */
	private function init() {
		load_plugin_textdomain( 'lime-product-labels', false, dirname( LPL_PLUGIN_BASENAME ) . '/languages' ); // phpcs:ignore PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound

		// Initialize core classes
		Admin::get_instance();
		Controller::get_instance();
		Frontend::get_instance();
	}

	/**
	 * Prevent cloning.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function __clone() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheating, huh?', 'lime-product-labels' ), '1.0.0' );
	}

	/**
	 * Prevent unserializing.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function __wakeup() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheating, huh?', 'lime-product-labels' ), '1.0.0' );
	}
}

add_action( 'plugins_loaded', array( 'LimeProductLabelsMain', 'get_instance' ) );
