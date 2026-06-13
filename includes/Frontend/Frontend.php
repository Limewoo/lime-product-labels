<?php
/**
 * Frontend functionality for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Frontend;

use LimeProductLabels\Compatibility\Compatibility;
use LimeProductLabels\Fields\Fields;
use LimeProductLabels\Labels\LabelRepository;
use LimeProductLabels\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Class Frontend
 *
 * Renders product label badges on archive and single product images.
 */
class Frontend {
	use Singleton;

	/**
	 * Transient key for cached bestseller product IDs.
	 */
	const BEST_SELLER_TRANSIENT = 'lpl_best_seller_ids';

	/**
	 * Number of top products that qualify as bestsellers (filterable).
	 */
	const BEST_SELLER_COUNT = 20;

	/**
	 * Active labels filtered by user condition.
	 *
	 * @var array
	 */
	private static array $labels = array();

	/**
	 * Global styles option data.
	 *
	 * @var array
	 */
	private static array $styles = array();

	/**
	 * Initializes hooks.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		// Compatibility: must run before hook filters below.
		Compatibility::get_instance();

		// Clear per-product transients when labels or styles change.
		add_action( 'update_option_' . LPL_OPTION_KEY, array( $this, 'clear_all_label_cache' ) );
		add_action( 'update_option_' . LabelRepository::CACHE_VERSION_KEY, array( $this, 'clear_all_label_cache' ) );
		add_action( 'woocommerce_update_product', array( $this, 'clear_product_label_cache' ) );
		add_action( 'set_object_terms', array( $this, 'maybe_clear_cache_on_terms_change' ), 10, 4 );

		if ( is_admin() && ! wp_doing_ajax() ) {
			return;
		}

		add_action( 'init', array( $this, 'lpl_init' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );

		/**
		 * Filter the WooCommerce archive hook used to render label badges.
		 *
		 * @since 1.0.0
		 *
		 * @param string $hook     Default: 'woocommerce_before_shop_loop_item'.
		 * @param int    $priority Default: 10.
		 */
		$archive_hook     = apply_filters( 'limewoo_lpl_archive_hook', 'woocommerce_before_shop_loop_item' );
		$archive_priority = apply_filters( 'limewoo_lpl_archive_hook_priority', 10 );
		add_action( $archive_hook, array( $this, 'render_archive_labels' ), $archive_priority );

		/**
		 * Filter the WooCommerce single product hook used to render label badges.
		 *
		 * @since 1.0.0
		 *
		 * @param string $hook     Default: 'woocommerce_product_thumbnails'.
		 * @param int    $priority Default: 10.
		 */
		$single_hook     = apply_filters( 'limewoo_lpl_single_product_hook', 'woocommerce_product_thumbnails' );
		$single_priority = apply_filters( 'limewoo_lpl_single_product_hook_priority', 10 );
		add_action( $single_hook, array( $this, 'render_single_labels' ), $single_priority );

		add_filter( 'woocommerce_single_product_image_gallery_classes', array( $this, 'add_gallery_class' ) );
	}

	/**
	 * Loads active labels (filtered by user condition) and global styles.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function lpl_init() {
		$all_labels   = LabelRepository::get_active_labels();
		self::$labels = array_values( array_filter( $all_labels, array( __CLASS__, 'check_user_condition' ) ) );
		self::$styles = limewoo_lpl_get_option_data( 'styles' );
	}

	/**
	 * Whether frontend assets should be enqueued on the current page.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	private static function should_enqueue() {
		return function_exists( 'is_woocommerce' ) && is_woocommerce();
	}

	/**
	 * Enqueues frontend CSS and injects CSS custom properties for manual styling.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( ! self::should_enqueue() || empty( self::$labels ) ) {
			return;
		}

		$asset_file = LPL_PLUGIN_PATH . 'build/frontend/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_style(
			'lime-product-labels-frontend',
			LPL_BUILD_URL . 'frontend/index.css',
			array_filter(
				$asset['dependencies'] ?? array(),
				function ( $dep ) {
					return wp_style_is( $dep, 'registered' );
				}
			),
			$asset['version']
		);

		$css_vars = self::generate_inline_css_vars();
		if ( $css_vars ) {
			wp_add_inline_style( 'lime-product-labels-frontend', $css_vars );
		}

		wp_enqueue_script(
			'lime-product-labels-frontend',
			LPL_BUILD_URL . 'frontend/index.js',
			$asset['dependencies'] ?? array(),
			$asset['version'],
			true
		);
	}

	/**
	 * Adds a positioning class to the single product image gallery wrapper.
	 *
	 * @since 1.0.0
	 *
	 * @param array $classes Existing gallery classes.
	 * @return array
	 */
	public function add_gallery_class( $classes ) {
		$classes[] = 'lpl-gallery-wrap';

		return $classes;
	}

	/**
	 * Renders eligible labels on product archive/loop pages.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function render_archive_labels() {
		global $product;

		if ( ! $product instanceof \WC_Product ) {
			return;
		}

		echo limewoo_lpl_kses( self::get_archive_labels_html( $product ) );
	}

	/**
	 * Returns the rendered archive label HTML for a product.
	 *
	 * Public so theme-compatibility code can call it when the standard
	 * archive hook is not available (e.g. WooCommerce Blocks).
	 *
	 * @since 1.0.0
	 *
	 * @param \WC_Product $product The product.
	 * @return string
	 */
	public static function get_archive_labels_html( \WC_Product $product ) : string {
		$labels = self::get_labels_for_product( $product->get_id() );
		$output = '';

		foreach ( $labels as $label ) {
			if ( ! in_array( 'archive', $label['show_on_pages'] ?? array(), true ) ) {
				continue;
			}

			$output .= self::render_label_html( $label, $label['archive_page_placement'] ?? 'top_left', $product );
		}

		return $output;
	}

	/**
	 * Renders eligible labels on single product pages.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function render_single_labels() {
		global $product;

		if ( ! $product instanceof \WC_Product ) {
			return;
		}

		$labels = self::get_labels_for_product( $product->get_id() );

		foreach ( $labels as $label ) {
			if ( ! in_array( 'product', $label['show_on_pages'] ?? array(), true ) ) {
				continue;
			}

			$html = self::render_label_html( $label, $label['product_page_placement'] ?? 'top_left', $product );
			if ( $html ) {
				echo limewoo_lpl_kses( $html );
			}
		}
	}

	/**
	 * Builds the badge HTML for a single label.
	 *
	 * @since 1.0.0
	 *
	 * @param array  $label     Label data.
	 * @param string $placement 'top_left' or 'top_right'.
	 * @return string
	 */
	private static function render_label_html( array $label, string $placement, ?\WC_Product $product = null ) {
		$label_type = $label['label_type'] ?? 'text';
		$name       = trim( $label['name'] ?? '' );

		if ( 'text' === $label_type && null !== $product && false !== strpos( $name, '{' ) ) {
			$name = trim( self::replace_label_tokens( $name, $product ) );
		}

		// Device visibility.
		$show_on_devices = $label['show_on_devices'] ?? array( 'desktop', 'mobile' );
		if ( empty( $show_on_devices ) ) {
			return '';
		}

		$has_desktop  = in_array( 'desktop', $show_on_devices, true );
		$has_mobile   = in_array( 'mobile', $show_on_devices, true );
		$device_class = '';

		if ( $has_desktop && ! $has_mobile ) {
			$device_class = 'lpl-label--desktop-only';
		} elseif ( ! $has_desktop && $has_mobile ) {
			$device_class = 'lpl-label--mobile-only';
		}

		$placement_class = 'lpl-label--' . str_replace( '_', '-', $placement );

		if ( 'image' === $label_type ) {
			$image    = is_array( $label['label_image'] ?? null ) ? $label['label_image'] : array();
			$image_id = absint( $image['id'] ?? 0 );
			$url      = $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : '';

			// Attachment may have been deleted — fall back to the stored URL.
			if ( ! $url && ! empty( $image['url'] ) ) {
				$url = $image['url'];
			}

			if ( ! $url ) {
				return '';
			}

			$alt = trim( $image['alt'] ?? '' );
			if ( '' === $alt ) {
				$alt = $name;
			}

			$classes = trim(
				implode(
					' ',
					array_filter(
						array(
							'lpl-label',
							'lpl-label--image',
							$placement_class,
							$device_class,
						)
					)
				)
			);

			return sprintf(
				'<div class="%s"><img class="lpl-label__image" src="%s" alt="%s" loading="lazy" /></div>',
				esc_attr( $classes ),
				esc_url( $url ),
				esc_attr( $alt )
			);
		}

		if ( '' === $name ) {
			return '';
		}

		$label_shape = $label['label_shape'] ?? 'text-shape-badge';
		$shape_key   = str_replace( 'text-shape-', '', $label_shape ); // e.g. 'badge', 'circle'

		$classes = trim(
			implode(
				' ',
				array_filter(
					array(
						'lpl-label',
						'lpl-label--' . $shape_key,
						$placement_class,
						$device_class,
					)
				)
			)
		);

		return sprintf(
			'<div class="%s"><span class="lpl-label__text">%s</span></div>',
			esc_attr( $classes ),
			esc_html( $name )
		);
	}

	/**
	 * Replaces {token} placeholders in a label name with product-specific values.
	 *
	 * @since 1.0.0
	 *
	 * @param string      $text    Raw label name containing tokens.
	 * @param \WC_Product $product Product to source values from.
	 * @return string
	 */
	private static function replace_label_tokens( string $text, \WC_Product $product ) : string {
		$stock_qty    = $product->managing_stock() ? (string) ( $product->get_stock_quantity() ?? '' ) : '';
		$stock_status = $product->is_in_stock()
			? esc_html__( 'In Stock', 'lime-product-labels' )
			: esc_html__( 'Out of Stock', 'lime-product-labels' );
		$sku          = $product->get_sku();

		$regular_price = '';
		$sale_price    = '';
		$sale_percent  = '';
		$sale_amount   = '';

		if ( $product->is_type( 'variable' ) ) {
			$reg = (float) $product->get_variation_regular_price( 'min' );
			$sal = (float) $product->get_variation_sale_price( 'min' );

			if ( $reg > 0 ) {
				$regular_price = wp_strip_all_tags( wc_price( $reg ) );
			}
			if ( $sal > 0 ) {
				$sale_price = wp_strip_all_tags( wc_price( $sal ) );
			}
			if ( $reg > 0 && $sal > 0 && $sal < $reg ) {
				$sale_percent = round( ( $reg - $sal ) / $reg * 100 ) . '%';
				$sale_amount  = wp_strip_all_tags( wc_price( $reg - $sal ) );
			}
		} elseif ( ! $product->is_type( 'grouped' ) ) {
			$reg = (float) $product->get_regular_price();
			$sal = (float) $product->get_sale_price();

			if ( $reg > 0 ) {
				$regular_price = wp_strip_all_tags( wc_price( $reg ) );
			}
			if ( $sal > 0 ) {
				$sale_price = wp_strip_all_tags( wc_price( $sal ) );
			}
			if ( $reg > 0 && $sal > 0 && $sal < $reg ) {
				$sale_percent = round( ( $reg - $sal ) / $reg * 100 ) . '%';
				$sale_amount  = wp_strip_all_tags( wc_price( $reg - $sal ) );
			}
		}

		return str_replace(
			array( '{sale_percent}', '{sale_amount}', '{stock_qty}', '{stock_status}', '{regular_price}', '{sale_price}', '{sku}' ),
			array( $sale_percent, $sale_amount, $stock_qty, $stock_status, $regular_price, $sale_price, $sku ),
			$text
		);
	}

	/**
	 * Generates CSS custom property declarations for manual badge styling.
	 *
	 * Only runs when style_method === 'manual'. Outputs to :root so all
	 * badges on the page share the same global style settings.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	private static function generate_inline_css_vars() {
		if ( 'manual' !== ( self::$styles['style_method'] ?? 'automatic' ) ) {
			return '';
		}

		$vars = array();

		foreach ( Fields::get_styles_fields() as $section ) {
			foreach ( $section['fields'] ?? array() as $field ) {
				if ( empty( $field['css_var'] ) || empty( $field['id'] ) ) {
					continue;
				}
				$key   = $field['id'];
				$value = self::$styles[ $key ] ?? '';
				if ( '' === $value ) {
					continue;
				}
				$vars[] = sprintf(
					'--lpl-%s: %s;',
					str_replace( '_', '-', $key ),
					esc_attr( $value )
				);
			}
		}

		return $vars ? ':root { ' . implode( ' ', $vars ) . ' }' : '';
	}

	/**
	 * Returns labels that are eligible for a given product.
	 *
	 * Results are version-keyed transient cached per product (user-keyed when
	 * any label has a non-'all' user_rule).
	 *
	 * @since 1.0.0
	 *
	 * @param int $product_id Product ID.
	 * @return array
	 */
	public static function get_labels_for_product( $product_id ) {
		$product_id = (int) $product_id;

		if ( empty( $product_id ) || empty( self::$labels ) ) {
			return array();
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return array();
		}

		$has_user_conditions = ! empty(
			array_filter(
				self::$labels,
				function ( $l ) {
					return ( $l['user_rule'] ?? 'all' ) !== 'all';
				}
			)
		);
		$user_suffix   = $has_user_conditions ? '_u' . get_current_user_id() : '';
		$version       = (int) get_option( LabelRepository::CACHE_VERSION_KEY, 0 );
		$transient_key = 'lpl_p_' . $product_id . '_' . $version . $user_suffix;

		$cached = get_transient( $transient_key );
		if ( false !== $cached ) {
			return $cached;
		}

		// Batch all taxonomy lookups into one query to avoid N+1 per product.
		$all_terms = wp_get_object_terms(
			$product_id,
			array( 'product_cat', 'product_tag', 'product_brand' ),
			array( 'fields' => 'id=>taxonomy' )
		);

		$product_categories = array();
		$product_tags       = array();
		$product_brands     = array();

		if ( ! is_wp_error( $all_terms ) ) {
			foreach ( $all_terms as $term_id => $taxonomy ) {
				if ( 'product_cat' === $taxonomy ) {
					$product_categories[] = (int) $term_id;
				} elseif ( 'product_tag' === $taxonomy ) {
					$product_tags[] = (int) $term_id;
				} elseif ( 'product_brand' === $taxonomy ) {
					$product_brands[] = (int) $term_id;
				}
			}
		}

		$eligible = array();

		foreach ( self::$labels as $label ) {
			$product_rule = $label['product_rule'] ?? 'all';

			$is_eligible = self::check_product_rule(
				$product,
				$product_id,
				$product_rule,
				$label,
				$product_categories,
				$product_tags,
				$product_brands
			);

			if ( $is_eligible && ! empty( $label['enable_exclusion'] ) ) {
				$is_eligible = ! self::is_product_excluded(
					$product,
					$product_id,
					$label,
					$product_categories,
					$product_tags,
					$product_brands
				);
			}

			if ( $is_eligible ) {
				$eligible[] = $label;
			}
		}

		/**
		 * Filter the eligible labels for a product.
		 *
		 * @since 1.0.0
		 *
		 * @param array $eligible   Labels that match this product.
		 * @param int   $product_id Product ID.
		 */
		$result = apply_filters( 'limewoo_lpl_eligible_labels', $eligible, $product_id );

		set_transient( $transient_key, $result, DAY_IN_SECONDS );

		return $result;
	}

	/**
	 * Evaluates the product_rule targeting condition for a single label.
	 *
	 * @since 1.0.0
	 *
	 * @param \WC_Product $product    Product object.
	 * @param int         $product_id Product ID.
	 * @param string      $rule       product_rule value.
	 * @param array       $label      Label data.
	 * @param int[]       $cats       Product category term IDs.
	 * @param int[]       $tags       Product tag term IDs.
	 * @param int[]       $brands     Product brand term IDs.
	 * @return bool
	 */
	private static function check_product_rule( \WC_Product $product, int $product_id, string $rule, array $label, array $cats, array $tags, array $brands ) {
		switch ( $rule ) {
			case 'all':
				return true;

			case 'on_sale':
				return $product->is_on_sale();

			case 'featured':
				return $product->is_featured();

			case 'new_arrivals':
				return self::is_new_arrival( $product, max( 1, (int) ( $label['new_arrivals_days'] ?? 30 ) ) );

			case 'out_of_stock':
				return ! $product->is_in_stock();

			case 'low_stock':
				return self::is_low_stock( $product );

			case 'best_sellers':
				return in_array( $product_id, self::get_best_seller_ids(), true );

			case 'top_rated':
				return self::is_top_rated( $product );

			case 'on_backorder':
				return $product->is_on_backorder();

			case 'products':
				$include = array_map( 'intval', $label['include_products'] ?? array() );
				if ( in_array( $product_id, $include, true ) ) {
					return true;
				}
				if ( $product->is_type( 'variable' ) ) {
					return ! empty( array_intersect( $product->get_children(), $include ) );
				}
				return false;

			case 'categories':
				$include = array_map( 'intval', $label['include_categories'] ?? array() );
				return ! empty( array_intersect( $cats, $include ) );

			case 'tags':
				$include = array_map( 'intval', $label['include_tags'] ?? array() );
				return ! empty( array_intersect( $tags, $include ) );

			case 'brands':
				$include = array_map( 'intval', $label['include_brands'] ?? array() );
				return ! empty( array_intersect( $brands, $include ) );
		}

		return false;
	}

	/**
	 * Evaluates exclusion rules. Returns true if the product should be excluded.
	 *
	 * @since 1.0.0
	 *
	 * @param \WC_Product $product    Product object.
	 * @param int         $product_id Product ID.
	 * @param array       $label      Label data.
	 * @param int[]       $cats       Product category term IDs.
	 * @param int[]       $tags       Product tag term IDs.
	 * @param int[]       $brands     Product brand term IDs.
	 * @return bool True if product is excluded, false if still eligible.
	 */
	private static function is_product_excluded( \WC_Product $product, int $product_id, array $label, array $cats, array $tags, array $brands ) {
		$exclude_rule = $label['exclude_rule'] ?? 'products';

		switch ( $exclude_rule ) {
			case 'products':
				$exclude = array_map( 'intval', $label['exclude_products'] ?? array() );
				if ( in_array( $product_id, $exclude, true ) ) {
					return true;
				}
				if ( $product->is_type( 'variable' ) ) {
					$remaining = array_diff( $product->get_children(), $exclude );
					if ( empty( $remaining ) ) {
						return true; // All variations excluded.
					}
				}
				break;

			case 'categories':
				$exclude = array_map( 'intval', $label['exclude_categories'] ?? array() );
				if ( ! empty( array_intersect( $cats, $exclude ) ) ) {
					return true;
				}
				break;

			case 'tags':
				$exclude = array_map( 'intval', $label['exclude_tags'] ?? array() );
				if ( ! empty( array_intersect( $tags, $exclude ) ) ) {
					return true;
				}
				break;

			case 'brands':
				$exclude = array_map( 'intval', $label['exclude_brands'] ?? array() );
				if ( ! empty( array_intersect( $brands, $exclude ) ) ) {
					return true;
				}
				break;
		}

		return false;
	}

	/**
	 * Checks if a product was published within the given number of days.
	 *
	 * @since 1.0.0
	 *
	 * @param \WC_Product $product Product object.
	 * @param int         $days    Lookback window in days.
	 * @return bool
	 */
	private static function is_new_arrival( \WC_Product $product, int $days ) {
		$date = $product->get_date_created();
		if ( ! $date ) {
			return false;
		}
		return ( time() - $date->getTimestamp() ) <= ( $days * DAY_IN_SECONDS );
	}

	/**
	 * Checks if a product is in stock but at or below its low-stock threshold.
	 *
	 * @since 1.0.0
	 *
	 * @param \WC_Product $product Product object.
	 * @return bool
	 */
	private static function is_low_stock( \WC_Product $product ) {
		if ( ! $product->is_in_stock() || ! $product->managing_stock() ) {
			return false;
		}
		$qty = $product->get_stock_quantity();
		if ( null === $qty ) {
			return false;
		}
		return $qty <= wc_get_low_stock_amount( $product );
	}

	/**
	 * Returns cached IDs of the top best-selling products.
	 *
	 * Cached for 6 hours. The count is filterable via limewoo_lpl_best_seller_count.
	 *
	 * @since 1.0.0
	 *
	 * @return int[]
	 */
	private static function get_best_seller_ids() {
		$cached = get_transient( self::BEST_SELLER_TRANSIENT );
		if ( false !== $cached ) {
			return (array) $cached;
		}

		global $wpdb;

		/**
		 * Filter the number of top products that qualify as best sellers.
		 *
		 * @since 1.0.0
		 *
		 * @param int $count Number of top products. Default 20.
		 */
		$count = absint( apply_filters( 'limewoo_lpl_best_seller_count', self::BEST_SELLER_COUNT ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT p.ID
				 FROM {$wpdb->posts} p
				 INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = 'total_sales'
				 WHERE p.post_type = 'product' AND p.post_status = 'publish'
				 ORDER BY CAST(pm.meta_value AS UNSIGNED) DESC
				 LIMIT %d",
				$count
			)
		);
		// phpcs:enable

		$ids = array_map( 'intval', $ids ?: array() );
		set_transient( self::BEST_SELLER_TRANSIENT, $ids, 6 * HOUR_IN_SECONDS );

		return $ids;
	}

	/**
	 * Checks if a product qualifies as top-rated (>= 4.0 average, at least 1 review).
	 *
	 * The threshold is filterable via limewoo_lpl_top_rated_threshold.
	 *
	 * @since 1.0.0
	 *
	 * @param \WC_Product $product Product object.
	 * @return bool
	 */
	private static function is_top_rated( \WC_Product $product ) {
		if ( $product->get_review_count() < 1 ) {
			return false;
		}

		/**
		 * Filter the minimum average rating for the 'top rated' product rule.
		 *
		 * @since 1.0.0
		 *
		 * @param float $threshold Minimum average rating. Default 4.0.
		 */
		$threshold = (float) apply_filters( 'limewoo_lpl_top_rated_threshold', 4.0 );

		return $product->get_average_rating() >= $threshold;
	}

	/**
	 * Checks if the current user satisfies a label's user condition.
	 *
	 * Label user fields are flat (user_rule / user_selection_type / selected_users /
	 * selected_user_roles), not grouped like the bxgy user_condition_rules array.
	 *
	 * @since 1.0.0
	 *
	 * @param array $label Label data.
	 * @return bool
	 */
	private static function check_user_condition( array $label ) {
		$user_rule = $label['user_rule'] ?? 'all';

		if ( 'all' === $user_rule ) {
			return true;
		}

		$user_selection_type = $label['user_selection_type'] ?? 'include';
		$current_user        = wp_get_current_user();

		if ( 'users' === $user_rule ) {
			$selected  = array_map( 'intval', $label['selected_users'] ?? array() );
			$is_in_list = $current_user->ID > 0 && in_array( $current_user->ID, $selected, true );
			return 'include' === $user_selection_type ? $is_in_list : ! $is_in_list;
		}

		if ( 'user_roles' === $user_rule ) {
			$selected_roles = $label['selected_user_roles'] ?? array();
			$user_roles     = (array) ( $current_user->roles ?? array() );
			$has_match      = ! empty( array_intersect( $user_roles, $selected_roles ) );
			return 'include' === $user_selection_type ? $has_match : ! $has_match;
		}

		return false;
	}

	/**
	 * Clears the best-seller transient when labels or styles change.
	 *
	 * Per-product transients become orphaned automatically when the cache
	 * version key is bumped by LabelRepository::bump_cache_version().
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function clear_all_label_cache() {
		delete_transient( self::BEST_SELLER_TRANSIENT );
	}

	/**
	 * Deletes the cached label result for a single product.
	 *
	 * @since 1.0.0
	 *
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public function clear_product_label_cache( $product_id ) {
		$version = (int) get_option( LabelRepository::CACHE_VERSION_KEY, 0 );
		delete_transient( 'lpl_p_' . (int) $product_id . '_' . $version );
		delete_transient( self::BEST_SELLER_TRANSIENT );
	}

	/**
	 * Clears a product's label cache when its taxonomy terms change.
	 *
	 * @since 1.0.0
	 *
	 * @param int    $object_id Object ID.
	 * @param array  $terms     Array of term IDs.
	 * @param array  $tt_ids    Array of term taxonomy IDs.
	 * @param string $taxonomy  Taxonomy slug.
	 * @return void
	 */
	public function maybe_clear_cache_on_terms_change( $object_id, $terms, $tt_ids, $taxonomy ) {
		if ( in_array( $taxonomy, array( 'product_cat', 'product_tag', 'product_brand' ), true ) ) {
			$this->clear_product_label_cache( $object_id );
		}
	}
}
