<?php
/**
 * Frontend functionality for Lime Product Labels.
 *
 * @package lime-product-labels
 */

namespace LimeProductLabels\Frontend;

use LimeProductLabels\Traits\Singleton;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Class Frontend
 *
 * Renders badge labels on product images. Phase 3 implementation.
 */
class Frontend {
	use Singleton;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		// Phase 3: badge overlay on product images.
	}
}
