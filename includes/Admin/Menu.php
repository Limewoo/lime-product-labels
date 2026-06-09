<?php
/**
 * Menu functionality for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Admin;

use LimeProductLabels\Traits\Singleton;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Class Menu
 */
class Menu {
	use Singleton;

	/**
	 * Admin menu slug.
	 */
	const MENU_SLUG = 'lime-product-labels';

	/**
	 * Initializes admin hooks.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		if ( ! is_admin() ) {
			return;
		}

		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_filter( 'add_menu_classes', array( $this, 'add_custom_menu_class' ) );
	}

	/**
	 * Registers admin menu and submenus.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function admin_menu() {
		/**
		 * Filter to modify the capability required to access the admin menu.
		 *
		 * @since 1.0.0
		 *
		 * @param string $capability Capability name.
		 */
		$capability = apply_filters( 'limewoo_lpl_capability', 'manage_options' );

		add_menu_page(
			esc_html__( 'Lime Product Labels', 'lime-product-labels' ),
			esc_html__( 'Lime Labels', 'lime-product-labels' ),
			$capability,
			self::MENU_SLUG,
			array( $this, 'render_content' ),
			'dashicons-tag',
			58
		);

		foreach ( self::get_menus() as $menu ) {
			if ( empty( $menu['slug'] ) ) {
				continue;
			}

			$menu_title      = esc_html( $menu['label'] ?? '' );
			$page_title      = $menu_title . ' - ' . esc_html__( 'Lime Product Labels', 'lime-product-labels' );
			$render_callback = array( $this, $menu['render_callback'] ?? 'render_content' );
			$position        = $menu['position'] ?? null;

			add_submenu_page(
				self::MENU_SLUG,
				$page_title,
				$menu_title,
				$capability,
				$menu['slug'],
				$render_callback,
				$position
			);
		}
	}

	/**
	 * Render the menu page.
	 *
	 * @since 1.0.0
	 */
	public function render_content() {
		?>
		<!--React will render content-->
		<div id="lime-product-labels-root"></div>
		<?php
	}

	/**
	 * Add custom classes to the menu item.
	 *
	 * @since 1.0.0
	 *
	 * @param array $menu Menu items.
	 * @return array
	 */
	public function add_custom_menu_class( $menu ) {
		foreach ( $menu as $key => $item ) {
			if ( isset( $item[2] ) && $item[2] === self::MENU_SLUG ) {
				$menu[ $key ][4] = ( $menu[ $key ][4] ?? '' ) . ' lime-product-labels-menu';
			}
		}

		return $menu;
	}

	/**
	 * Returns an array of admin menus.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public static function get_menus() {
		$menus = array(
			'labels'   => array(
				'label'    => esc_html__( 'Labels', 'lime-product-labels' ),
				'id'       => 'labels',
				'slug'     => self::MENU_SLUG,
				'position' => 0,
			),
			'styles'   => array(
				'label'    => esc_html__( 'Styles', 'lime-product-labels' ),
				'id'       => 'styles',
				'slug'     => self::MENU_SLUG . '&tab=styles',
				'position' => 1,
			),
			'settings' => array(
				'label'    => esc_html__( 'Settings', 'lime-product-labels' ),
				'id'       => 'settings',
				'slug'     => self::MENU_SLUG . '&tab=settings',
				'position' => 2,
			),
		);

		/**
		 * Filter to modify the admin menus.
		 *
		 * @since 1.0.0
		 *
		 * @param array $menus Array of menu items.
		 */
		return apply_filters( 'limewoo_lpl_admin_menus', $menus );
	}
}
