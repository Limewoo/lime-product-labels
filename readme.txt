=== Lime Product Labels ===
Contributors: limewoo, thenahidul
Tags: product labels, product badges, woocommerce badges, sale badge, product stickers
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add custom badge labels to WooCommerce product images. Highlight sales, new arrivals, best sellers, low stock, and more with customizable styles.

== Description ==

Lime Product Labels lets you attach eye-catching badges to your WooCommerce product images to highlight promotions, availability, and other key product attributes.

> More WooCommerce plugins at [limewoo.com](https://limewoo.com).

**Key features:**

* Create unlimited product labels with custom text or images
* 8 built-in label shapes: badge, tag, chevron, circle, banner, corner, burst, shield
* Flexible targeting: all products, on sale, featured, new arrivals, out of stock, low stock, best sellers, top rated, on backorder, specific products, categories, tags, or brands
* Placement control: top-left or top-right on product pages and archive/shop pages
* Device visibility: show on desktop, mobile, or both
* User condition rules: show labels to specific users or user roles only
* Dynamic shortcodes in label names: `{sale_percent}`, `{sale_amount}`, `{stock_qty}`, `{stock_status}`, `{regular_price}`, `{sale_price}`, `{sku}`
* Manual styling: background color, text color, font size, corner radius, padding, and more; or let the plugin auto-match your theme
* Export and import labels as JSON for easy backups and site migrations
* Theme compatibility layer for Woostify and Botiga
* WooCommerce HPOS (Custom Order Tables) compatible

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/lime-product-labels` directory, or install the plugin through the WordPress Plugins screen directly.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Make sure WooCommerce is installed and active.
4. Go to **Lime Labels** in the WordPress admin menu to create your first label.

== Frequently Asked Questions ==

= Does this plugin require WooCommerce? =

Yes. Lime Product Labels requires WooCommerce to be installed and active.

= Which PHP version is required? =

PHP 8.0 or higher.

= Can I use image labels instead of text? =

Yes. When creating a label, set the label type to **Image** and upload a PNG, JPG, or SVG file (SVG requires a plugin such as Safe SVG to be installed).

= Can I show different labels to different users? =

Yes. Each label has an **Advanced Settings** section where you can restrict visibility to specific users or user roles (include or exclude).

= Are label positions customizable? =

You can place each label in the top-left or top-right corner of the product image, independently for the product page and archive pages.

= Will this slow down my store? =

No. Badge HTML is rendered server-side by PHP. Eligible labels per product are cached in versioned transients for up to 24 hours. The cache is automatically invalidated when labels or products change.

= Can I export and import my label settings? =

Yes. Go to **Lime Labels → Settings → Export & Import** to download all your labels as a JSON file or restore them from a backup.

== Screenshots ==

1. Label list: manage all your product badges in one place.
2. Label editor for text shape: configure targeting rules, placement, shape, and styling.
3. Label editor for image shape: upload a custom PNG, JPG, or SVG badge image.
4. Styles tab: choose automatic styling or configure colors, font size, padding, and more manually.
5. Settings tab: export or import labels and manage plugin data.
6. Storefront archive: badges displayed on the shop and category pages.
7. Storefront single product: badge displayed on the single product image.

== Source Code ==

The full source code, including all JavaScript source files, SCSS, and build configuration, is publicly available at:
https://github.com/Limewoo/lime-product-labels

To regenerate the compiled assets from source:

1. Run `npm install` (or `bun install`) to install dependencies.
2. Run `npm run build` (or `bun run build`) to produce the files in `build/`.

The build uses `@wordpress/scripts` (webpack) with a custom `webpack.config.js`. Source files live in the `src/` directory.

== More Plugins ==

Find more WooCommerce plugins by Limewoo at [limewoo.com](https://limewoo.com).

== Changelog ==

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
