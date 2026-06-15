# Lime Product Labels

Add customizable visual badge labels to WooCommerce product images: Sale, New, Hot, and more.

> More WooCommerce plugins at [limewoo.com](https://limewoo.com).

## Requirements

- WordPress 6.5+
- WooCommerce 8.0+
- PHP 8.0+

## Features

- Unlimited product labels with custom text or image badges
- 8 built-in shapes: badge, tag, chevron, circle, banner, corner, burst, shield
- Dynamic token shortcodes in label names: `{sale_percent}`, `{sale_amount}`, `{stock_qty}`, `{stock_status}`, `{regular_price}`, `{sale_price}`, `{sku}`
- Flexible targeting: all products, on sale, featured, new arrivals, out of stock, low stock, best sellers, top rated, on backorder, specific products, categories, tags, or brands
- Placement control: top-left or top-right, independently per product page and archive/shop page
- Device visibility: desktop, mobile, or both
- User condition rules: restrict labels to specific users or user roles
- Manual styling: background color, text color, font size, corner radius, padding, and more; or auto-match the theme
- Export and import labels as JSON
- Theme compatibility: Woostify, Botiga
- WooCommerce HPOS (Custom Order Tables) compatible

## Development

### JavaScript

```bash
bun install

bun start          # dev build with watch
bun run build      # production build
bun run zip        # production build + distributable .zip
```

### PHP

```bash
composer install

composer run phpcs        # lint (WordPress + WooCommerce-Core + PHPCompatibilityWP rules)
composer run phpcs:fix    # auto-fix sniff violations
```

### Build output

Webpack produces two bundles in `build/`:

- `build/admin/index.js` + `build/admin/index.css` (React/Polaris admin UI)
- `build/frontend/index.js` (frontend badge styles)

### Path aliases

| Alias | Resolves to |
|---|---|
| `@core` | `src/core/` |
| `@coreJS` | `src/core/js/` |
| `@admin` | `src/admin/js/` |
| `@frontend` | `src/frontend/js/` |
| `@adminImages` | `src/admin/images/` |
| `@frontendImages` | `src/frontend/images/` |

## Architecture

Badge rendering is PHP server-side only (no JS on the storefront). Active labels are cached in version-keyed transients (invalidated automatically on any label change).

Labels are stored in a custom DB table (`wp_lime_product_labels`). Styles and settings are stored in a single `lime_product_labels` wp_option as JSON.

See [`CLAUDE.md`](CLAUDE.md) for full architecture documentation.

## License

GPL-2.0-or-later. See [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html).
