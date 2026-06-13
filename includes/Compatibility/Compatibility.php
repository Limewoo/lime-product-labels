<?php
/**
 * Theme and plugin compatibility.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Compatibility;

use LimeProductLabels\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Class Compatibility
 *
 * Central place for theme/plugin-specific overrides. Each method handles
 * one integration and is a no-op when that theme/plugin is not active.
 */
class Compatibility {
	use Singleton;

	/**
	 * Registers compatibility hooks.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		$this->woostify();
		$this->botiga();
	}

	/**
	 * Returns true when the active theme (or its parent) matches any of the given slugs.
	 *
	 * @since 1.0.0
	 *
	 * @param string ...$slugs Lowercase theme slugs to test against.
	 * @return bool
	 */
	private function is_theme( string ...$slugs ) : bool {
		$theme  = wp_get_theme();
		$name   = strtolower( $theme->get( 'Name' ) );
		$parent = strtolower( $theme->get( 'Template' ) );

		return in_array( $name, $slugs, true ) || in_array( $parent, $slugs, true );
	}

	/**
	 * Woostify theme compatibility.
	 *
	 * Woostify replaces the standard WooCommerce single product gallery with
	 * its own markup inside `<div class="product-gallery">`, rendered via
	 * `woocommerce_before_single_product_summary` (open: priority 20, images:
	 * priority 30, close: priority 50). The WooCommerce default gallery
	 * still fires at priority 21 but is hidden by Woostify's CSS, so any
	 * badge rendered via `woocommerce_product_thumbnails` ends up invisible.
	 *
	 * Fix: move the single product badge hook to
	 * `woocommerce_before_single_product_summary` at priority 22 — inside the
	 * open `.product-gallery` wrapper but before Woostify's image slide —
	 * and give `.product-gallery` `position:relative` so absolute badges
	 * anchor to it.
	 *
	 * @since 1.0.0
	 */
	private function woostify() {
		if ( ! $this->is_theme( 'woostify' ) ) {
			return;
		}

		add_filter( 'limewoo_lpl_single_product_hook', function () {
			return 'woocommerce_before_single_product_summary';
		} );

		add_filter( 'limewoo_lpl_single_product_hook_priority', function () {
			return 22;
		} );

		add_action(
			'wp_enqueue_scripts',
			function () {
				wp_add_inline_style(
					'lime-product-labels-frontend',
					'.product-gallery { position: relative; }'
				);
			},
			20
		);
	}

	/**
	 * Botiga theme compatibility.
	 *
	 * Botiga wraps each product's image in a `<div class="loop-image-wrap">` that already
	 * has `position:relative; overflow:hidden`. For grid/masonry the wrapper opens at
	 * priority 9 and closes at priority 11 of `woocommerce_before_shop_loop_item_title`;
	 * for list layout it opens at priority 1 of `woocommerce_before_shop_loop_item` and
	 * still closes at priority 11 of `woocommerce_before_shop_loop_item_title`. Rendering
	 * at priority 10 of `woocommerce_before_shop_loop_item_title` places the badge inside
	 * the image wrap in both cases.
	 *
	 * @since 1.0.0
	 */
	private function botiga() {
		if ( ! $this->is_theme( 'botiga' ) ) {
			return;
		}

		add_filter( 'limewoo_lpl_archive_hook', function () {
			return 'woocommerce_before_shop_loop_item_title';
		} );

		add_filter( 'limewoo_lpl_archive_hook_priority', function () {
			return 10;
		} );
	}
}
