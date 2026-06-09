<?php
/**
 * Singleton trait for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Traits;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Trait for a Singleton pattern.
 */
trait Singleton {
	/**
	 * Singleton instance.
	 *
	 * @var null
	 */
	protected static $instance = null;

	/**
	 * Returns a single shared instance of the class.
	 *
	 * @since 1.0.0
	 *
	 * @return static
	 */
	public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	/**
	 * Prevent direct instantiation.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	protected function __construct() {}

	/**
	 * Prevent cloning of the instance.
	 *
	 * @since 1.0.0
	 *
	 * @return mixed
	 * @throws \Exception
	 */
	public function __clone() {
		throw new \Exception( 'Cloning is not allowed.' );
	}

	/**
	 * Prevent un-serializing of the instance.
	 *
	 * @since 1.0.0
	 *
	 * @return mixed
	 * @throws \Exception
	 */
	public function __wakeup() {
		throw new \Exception( 'Deserialization is not allowed.' );
	}
}
