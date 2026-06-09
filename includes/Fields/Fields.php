<?php
/**
 * Fields for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Fields;

use LimeProductLabels\Traits\Singleton;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Class Fields
 *
 * Single source of truth for all field schemas (used by PHP sanitization and JS form rendering).
 */
class Fields {
	use Singleton;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {}

	/**
	 * Get the fields for a label.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public static function get_label_fields() {
		$fields = array(
			array(
				'section_id' => 'hidden',
				'fields'     => array(
					array(
						'id'           => 'id',
						'type'         => 'hidden',
						'label'        => esc_html__( 'Label ID', 'lime-product-labels' ),
						'label_hidden' => true,
						'section_id'   => 'hidden',
						'default'      => wp_generate_uuid4(),
						'schema'       => array(
							'type'     => 'string',
							'required' => true,
						),
					),
				),
			),

			array(
				'section_id' => 'default',
				'classes'    => 'lime-product-labels__section-tiny',
				'accordion'  => false,
				'fields'     => array(
					array(
						'id'          => 'name',
						'type'        => 'text',
						'label'       => esc_html__( 'Label Name', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Enter label name', 'lime-product-labels' ),
						'default'     => esc_html__( 'New Label', 'lime-product-labels' ),
						'schema'      => array( 'type' => 'string' ),
					),
				),
			),

			array(
				'section_id' => 'action',
				'fields'     => array(
					array(
						'id'      => 'status',
						'type'    => 'select',
						'label'   => esc_html__( 'Label status', 'lime-product-labels' ),
						'options' => array(
							array(
								'label' => esc_html__( 'Active', 'lime-product-labels' ),
								'value' => 'active',
							),
							array(
								'label' => esc_html__( 'Inactive', 'lime-product-labels' ),
								'value' => 'inactive',
							),
						),
						'default' => 'active',
						'schema'  => array(
							'type' => 'string',
							'enum' => array( 'active', 'inactive' ),
						),
					),
				),
			),

			array(
				'section_id' => 'targeting',
				'title'      => esc_html__( 'Targeting', 'lime-product-labels' ),
				'classes'    => 'lime-product-labels__section-tiny',
				'accordion'  => false,
				'fields'     => array(
					array(
						'id'      => 'product_rule',
						'type'    => 'select',
						'label'   => esc_html__( 'Products to show this label on', 'lime-product-labels' ),
						'options' => array(
							array(
								'label' => esc_html__( 'All products', 'lime-product-labels' ),
								'value' => 'all',
							),
							array(
								'label' => esc_html__( 'Specific products', 'lime-product-labels' ),
								'value' => 'products',
							),
							array(
								'label' => esc_html__( 'Specific categories', 'lime-product-labels' ),
								'value' => 'categories',
							),
							array(
								'label' => esc_html__( 'Specific tags', 'lime-product-labels' ),
								'value' => 'tags',
							),
							array(
								'label' => esc_html__( 'Specific brands', 'lime-product-labels' ),
								'value' => 'brands',
							),
						),
						'default' => 'products',
						'schema'  => array(
							'type' => 'string',
							'enum' => array( 'all', 'products', 'categories', 'tags', 'brands' ),
						),
					),
					array(
						'id'          => 'include_products',
						'type'        => 'select',
						'label'       => esc_html__( 'Select Products', 'lime-product-labels' ),
						'desc'        => esc_html__( 'Label will appear on selected products.', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select products', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'products',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'products' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'include_categories',
						'type'        => 'select',
						'label'       => esc_html__( 'Categories', 'lime-product-labels' ),
						'desc'        => esc_html__( 'Label will appear on products from selected categories.', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select categories', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'categories',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'categories' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'include_tags',
						'type'        => 'select',
						'label'       => esc_html__( 'Tags', 'lime-product-labels' ),
						'desc'        => esc_html__( 'Label will appear on products from selected tags.', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select tags', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'tags',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'tags' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'include_brands',
						'type'        => 'select',
						'label'       => esc_html__( 'Brands', 'lime-product-labels' ),
						'desc'        => esc_html__( 'Label will appear on products from selected brands.', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select brands', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'brands',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'brands' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'         => 'enable_exclusion',
						'type'       => 'checkbox',
						'label'      => esc_html__( 'Enable products exclusion', 'lime-product-labels' ),
						'default'    => false,
						'conditions' => array(
							'rules' => array(
								array(
									'field'    => 'product_rule',
									'operator' => 'not_in',
									'value'    => array( 'products' ),
								),
							),
						),
						'schema'     => array(
							'type' => 'boolean',
						),
					),
					array(
						'id'         => 'exclude_rule',
						'type'       => 'select',
						'label'      => esc_html__( 'Choose how products are excluded for this label', 'lime-product-labels' ),
						'options'    => array(
							array(
								'label' => esc_html__( 'Specific products', 'lime-product-labels' ),
								'value' => 'products',
							),
							array(
								'label' => esc_html__( 'Specific categories', 'lime-product-labels' ),
								'value' => 'categories',
							),
							array(
								'label' => esc_html__( 'Specific tags', 'lime-product-labels' ),
								'value' => 'tags',
							),
							array(
								'label' => esc_html__( 'Specific brands', 'lime-product-labels' ),
								'value' => 'brands',
							),
						),
						'default'    => 'products',
						'conditions' => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'enable_exclusion',
									'operator' => '===',
									'value'    => true,
								),
								array(
									'field'    => 'product_rule',
									'operator' => 'not_in',
									'value'    => array( 'products' ),
								),
							),
						),
						'schema'     => array(
							'type' => 'string',
							'enum' => array( 'products', 'categories', 'tags', 'brands' ),
						),
					),
					array(
						'id'          => 'exclude_products',
						'type'        => 'select',
						'label'       => esc_html__( 'Exclude products', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select products', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'products',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'enable_exclusion',
									'operator' => '===',
									'value'    => true,
								),
								array(
									'field'    => 'product_rule',
									'operator' => 'not_in',
									'value'    => array( 'products' ),
								),
								array(
									'field'    => 'exclude_rule',
									'operator' => 'in',
									'value'    => array( 'products' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'exclude_categories',
						'type'        => 'select',
						'label'       => esc_html__( 'Exclude categories', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select categories', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'categories',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'enable_exclusion',
									'operator' => '===',
									'value'    => true,
								),
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'all' ),
								),
								array(
									'field'    => 'exclude_rule',
									'operator' => 'in',
									'value'    => array( 'categories' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'exclude_tags',
						'type'        => 'select',
						'label'       => esc_html__( 'Exclude tags', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select tags', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'tags',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'enable_exclusion',
									'operator' => '===',
									'value'    => true,
								),
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'all' ),
								),
								array(
									'field'    => 'exclude_rule',
									'operator' => 'in',
									'value'    => array( 'tags' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'exclude_brands',
						'type'        => 'select',
						'label'       => esc_html__( 'Exclude brands', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select brands', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'brands',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'enable_exclusion',
									'operator' => '===',
									'value'    => true,
								),
								array(
									'field'    => 'product_rule',
									'operator' => 'in',
									'value'    => array( 'all' ),
								),
								array(
									'field'    => 'exclude_rule',
									'operator' => 'in',
									'value'    => array( 'brands' ),
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
				),
			),
			array(
				'section_id' => 'placement_and_visibility',
				'title'      => esc_html__( 'Placement and Visibility', 'lime-product-labels' ),
				'classes'    => 'lime-product-labels__section-tiny',
				'accordion'  => false,
				'fields'     => array(
					array(
						'id'       => 'show_on_pages',
						'type'     => 'checkbox',
						'label'    => esc_html__( 'Show on', 'lime-product-labels' ),
						'multiple' => true,
						'stacked'  => true,
						'desc'     => '',
						'options'  => array(
							array(
								'label' => esc_html__( 'Product page', 'lime-product-labels' ),
								'value' => 'product',
							),
							array(
								'label' => esc_html__( 'Archive pages', 'lime-product-labels' ),
								'value' => 'archive',
							),
						),
						'default' => array( 'product', 'archive' ),
						'schema'  => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
					),
					array(
						'id'      => 'product_page_placement',
						'type'    => 'select',
						'label'   => esc_html__( 'Placement on product page', 'lime-product-labels' ),
						'options' => array(
							array(
								'label' => esc_html__( 'Top left', 'lime-product-labels' ),
								'value' => 'top_left',
							),
							array(
								'label' => esc_html__( 'Top right', 'lime-product-labels' ),
								'value' => 'top_right',
							),
						),
						'default'    => 'top_left',
						'conditions' => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'show_on_pages',
									'operator' => 'in',
									'value'    => array( 'product' ),
								),
							),
						),
						'schema' => array(
							'type' => 'string',
							'enum' => array( 'top_left', 'top_right' ),
						),
					),
					array(
						'id'      => 'archive_page_placement',
						'type'    => 'select',
						'label'   => esc_html__( 'Placement on archive pages', 'lime-product-labels' ),
						'options' => array(
							array(
								'label' => esc_html__( 'Top left', 'lime-product-labels' ),
								'value' => 'top_left',
							),
							array(
								'label' => esc_html__( 'Top right', 'lime-product-labels' ),
								'value' => 'top_right',
							),
						),
						'default'    => 'top_left',
						'conditions' => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'show_on_pages',
									'operator' => 'in',
									'value'    => array( 'archive' ),
								),
							),
						),
						'schema' => array(
							'type' => 'string',
							'enum' => array( 'top_left', 'top_right' ),
						),
					),
					array(
						'id'       => 'show_on_devices',
						'type'     => 'checkbox',
						'label'    => esc_html__( 'Show on devices', 'lime-product-labels' ),
						'multiple' => true,
						'desc'     => '',
						'options'  => array(
							array(
								'label' => esc_html__( 'Desktop & Tablet', 'lime-product-labels' ),
								'value' => 'desktop',
							),
							array(
								'label' => esc_html__( 'Mobile', 'lime-product-labels' ),
								'value' => 'mobile',
							),
						),
						'default' => array( 'desktop', 'mobile' ),
						'schema'  => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
					),
				),
			),

			array(
				'section_id' => 'label_design',
				'title'      => esc_html__( 'Label Design', 'lime-product-labels' ),
				'classes'    => 'lime-product-labels__section-tiny',
				'accordion'  => false,
				'fields'     => array(
					array(
						'id'      => 'label_type',
						'type'    => 'select',
						'label'   => esc_html__( 'Label type', 'lime-product-labels' ),
						'options' => array(
							array(
								'label' => esc_html__( 'Text', 'lime-product-labels' ),
								'value' => 'text',
							),
							array(
								'label' => esc_html__( 'Image', 'lime-product-labels' ),
								'value' => 'image',
							),
						),
						'default' => 'text',
						'schema'  => array(
							'type' => 'string',
							'enum' => array( 'text', 'image' ),
						),
					),
					array(
						'id'         => 'label_shape',
						'type'       => 'shape-select',
						'label'      => esc_html__( 'Label shape', 'lime-product-labels' ),
						'default'    => 'text-shape-badge',
						'attributes' => array(
							'shape_type' => 'text',
						),
						'conditions' => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'label_type',
									'operator' => '===',
									'value'    => 'text',
								),
							),
						),
						'schema'     => array(
							'type' => 'string',
							'enum' => array(
								'text-shape-badge',
								'text-shape-tag',
								'text-shape-chevron',
								'text-shape-circle',
								'text-shape-banner',
								'text-shape-corner',
								'text-shape-burst',
								'text-shape-shield',
							),
						),
					),
				),
			),

			array(
				'section_id' => 'advanced',
				'title'      => esc_html__( 'Advanced Settings', 'lime-product-labels' ),
				'fields'     => array(
					array(
						'id'          => 'user_rule',
						'type'        => 'select',
						'label'       => esc_html__( 'User condition', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select an option', 'lime-product-labels' ),
						'options'     => array(
							array(
								'label' => esc_html__( 'All users', 'lime-product-labels' ),
								'value' => 'all',
							),
							array(
								'label' => esc_html__( 'Selected users', 'lime-product-labels' ),
								'value' => 'users',
							),
							array(
								'label' => esc_html__( 'Selected roles', 'lime-product-labels' ),
								'value' => 'user_roles',
							),
						),
						'default'     => 'all',
						'schema'      => array(
							'type' => 'string',
							'enum' => array( 'all', 'users', 'user_roles' ),
						),
					),
					array(
						'id'           => 'user_selection_type',
						'type'         => 'select',
						'label'        => esc_html__( 'User selection type', 'lime-product-labels' ),
						'label_hidden' => true,
						'options'      => array(
							array(
								'label' => esc_html__( 'Include', 'lime-product-labels' ),
								'value' => 'include',
							),
							array(
								'label' => esc_html__( 'Exclude', 'lime-product-labels' ),
								'value' => 'exclude',
							),
						),
						'default'    => 'include',
						'conditions' => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'user_rule',
									'operator' => 'not_in',
									'value'    => array( 'all' ),
								),
							),
						),
						'schema'     => array(
							'type' => 'string',
							'enum' => array( 'include', 'exclude' ),
						),
					),
					array(
						'id'          => 'selected_users',
						'type'        => 'select',
						'label'       => esc_html__( 'Select users', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select users', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'users',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'user_rule',
									'operator' => '===',
									'value'    => 'users',
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					array(
						'id'          => 'selected_user_roles',
						'type'        => 'select',
						'label'       => esc_html__( 'User roles', 'lime-product-labels' ),
						'placeholder' => esc_html__( 'Select user roles', 'lime-product-labels' ),
						'default'     => array(),
						'multiple'    => true,
						'attributes'  => array(
							'data_source' => 'user_roles',
						),
						'conditions'  => array(
							'logic' => 'AND',
							'rules' => array(
								array(
									'field'    => 'user_rule',
									'operator' => '===',
									'value'    => 'user_roles',
								),
							),
						),
						'schema'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
					),
				),
			),
		);

		/**
		 * Filter label fields.
		 *
		 * @since 1.0.0
		 *
		 * @param array $fields Field definitions.
		 */
		$fields = apply_filters( 'limewoo_lpl_label_fields', $fields );

		return ! is_array( $fields ) ? array() : $fields;
	}

	/**
	 * Get the fields for the Styles tab.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public static function get_styles_fields() {
		$fields = array();

		/**
		 * Filter styles fields.
		 *
		 * @since 1.0.0
		 *
		 * @param array $fields Field definitions.
		 */
		$fields = apply_filters( 'limewoo_lpl_styles_fields', $fields );

		return ! is_array( $fields ) ? array() : $fields;
	}

	/**
	 * Get the fields for the Settings tab.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public static function get_settings_fields() {
		$fields = array();

		/**
		 * Filter settings fields.
		 *
		 * @since 1.0.0
		 *
		 * @param array $fields Field definitions.
		 */
		$fields = apply_filters( 'limewoo_lpl_settings_fields', $fields );

		return ! is_array( $fields ) ? array() : $fields;
	}

	/**
	 * Retrieve all field sets, keyed by tab.
	 *
	 * @since 1.0.0
	 *
	 * @param string $key Optional. Specific field set key. Default empty returns all.
	 * @return array
	 */
	public static function get_all_fields( $key = '' ) {
		$fields = array(
			'labels'   => self::get_label_fields(),
			'styles'   => self::get_styles_fields(),
			'settings' => self::get_settings_fields(),
		);

		return $key ? ( $fields[ $key ] ?? array() ) : $fields;
	}
}
