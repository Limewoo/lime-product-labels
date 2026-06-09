# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Rules

- **Never commit without explicit user confirmation.** Always show what will be committed and ask first.

## Commands

### JavaScript
```bash
bun start          # dev build with watch
bun run build      # production build
bun run zip        # production build + create distributable .zip (excludes src/, node_modules, dev files)
```

### PHP
```bash
composer run phpcs        # lint (WordPress + WooCommerce-Core + PHPCompatibilityWP rules)
composer run phpcs:fix    # auto-fix sniff violations
```

No PHP test suite exists — `composer run-tests` only runs PHPCS.

---

## PHP Architecture

### Bootstrap
`lime-product-labels.php` defines all `LWPL_*` constants, registers activation/deactivation hooks (`Install::activate/deactivate`), and initialises `LimeProductLabelsMain` on `plugins_loaded`. `LimeProductLabelsMain::init()` instantiates the three core singletons in order: `Admin → Controller → Frontend`.

### Autoloading
PSR-4: `LimeProductLabels\` maps to `includes/`. `includes/helpers.php` is autoloaded as a file (global functions). All classes use `use LimeProductLabels\Traits\Singleton` — never call constructors directly; use `ClassName::get_instance()`.

### Core classes
| Class | Responsibility |
|---|---|
| `Install` | DB table creation (`wp_lime_product_labels`), activate/deactivate hooks |
| `Labels\LabelRepository` | All label DB operations: paginated list, create, update, delete, reorder, get_active_labels (version-keyed transient cache). File: `includes/Labels/LabelRepository.php` |
| `Fields` | Single source of truth for all label/styles/settings field schemas (used by both PHP sanitization and JS form rendering) |
| `Admin` | Enqueues admin assets, passes `window.LimeProductLabels` localized data |
| `Controller` | REST API (`lime_product_labels/v1`). Label CRUD: `GET/POST /labels`, `GET/PUT/DELETE /labels/{id}`, `POST /labels/reorder`. Styles + settings saved via WP Settings API. Data endpoints: /products, /taxonomies, /users, /user_roles, /coupons |
| `Frontend` | Badge overlay on product images (Phase 3, stub for now) |

No License, Updater, or Analytics classes.

### Data storage
**Labels** live in `wp_lime_product_labels` (custom DB table, created by `Install`). Always read/write labels via `LabelRepository` — never from the wp_option directly.

**Styles and settings** live in the `lime_product_labels` wp_option as a JSON object with two keys: `styles{}`, `settings{}`. Read via `limewoo_lpl_get_option_data()` which is statically memoized per request.

**Constants:**
- `LWPL_LABELS_TABLE` → `'lime_product_labels'` (without `$wpdb->prefix`)
- `LWPL_OPTION_KEY` → `'lime_product_labels'`

### Label fields
```php
// Section: hidden   → 'id' (hidden, UUID)
// Section: default  → 'name' (text, 'Label Name')
// Section: action   → 'status' (select, active/inactive)
// Section: targeting — product_rule, include/exclude fields (same pattern as bxgy customer_buys, no quantity fields)
// Section: placement_and_visibility — show_on_pages (checkbox: product/archive), product_page_placement (select: top_left/top_right), archive_page_placement (select: top_left/top_right), show_on_devices (checkbox: desktop/mobile)
// Section: label_design — label_type (select: text/image, default: text), label_shape (shape-select, conditional on label_type=text, default: text-shape-badge)
// Section: advanced — user_rule, user_selection_type, selected_users (data_source:users), selected_user_roles (data_source:user_roles) — flat fields, NOT group type (no GroupFields renderer exists)
// get_styles_fields() → section: label_styling — style_method (select: automatic/manual), badge_bg (color), badge_color (color, col:half pair with badge_bg), badge_radius (unit+slider), badge_font_size (unit+slider), badge_padding_block (unit+slider), badge_padding_inline (unit+slider). All manual fields conditional on style_method===manual.
// get_settings_fields() → []  (stub, populate in future phase)
```

**`shape-select` field type:** custom type handled in `RenderFields.jsx` → `ShapeSelect.jsx`. Renders a grid of SVG shape buttons. SVGs live in `src/admin/images/shapes/` (8 text shapes: badge, tag, chevron, circle, banner, corner, burst, shield). `attributes.shape_type` selects which set to show (currently only `text`). Do NOT use `group` type for user condition fields — this plugin has no `GroupFields` renderer.

### PHPCS rules
- Required prefixes: `limewoo, LimeProductLabels`
- Text domain: `lime-product-labels`
- Excluded sniffs: `WordPress.Files.FileName.NotHyphenatedLowercase`, `Core.Commenting.CommentTags.AuthorTag`
- PHP 8.0+ target (`testVersion = "8.0-"`)
- Table name interpolation in `$wpdb` queries requires `// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared` with a comment explaining the value is from a plugin constant

---

## JavaScript Architecture

### Build outputs
Webpack (`@wordpress/scripts` base config + custom `webpack.config.js`) produces two bundles in `build/`:
- `build/admin/index.js` + `build/admin/index.css` — React/Polaris admin UI + styles
- `build/frontend/index.js` — storefront badge rendering (Phase 3 stub)

Each bundle generates a `*.asset.php` file (dependencies + version hash) consumed by `wp_enqueue_script`.

### SCSS structure
```
src/core/scss/
├── variables.scss   — design tokens ($colors, $gaps, $border-radius), animations, mixins
└── utils.scss       — utility classes (flex, gap, position, text-align, etc.)

src/admin/scss/
├── fonts.scss       — @font-face declarations for Inter (Regular 400, Bold 700)
└── index.scss       — all admin component styles (topbar, tabs, fields, sortable table, modal, preview, pagination)

src/admin/fonts/
├── Inter-Regular.woff2
└── Inter-Bold.woff2
```

`index.scss` imports via relative paths (`../../core/scss/variables`), not webpack aliases, to keep SCSS resolution stable.

### Path aliases
```
@core        → src/core/
@coreJS      → src/core/js/
@admin       → src/admin/js/
@frontend    → src/frontend/js/
@adminImages → src/admin/images/
@frontendImages → src/frontend/images/
```

### Shared core (`src/core/`)
- `api.js` — all `apiFetch` calls. Nonce middleware auto-applied at module load from `window.LimeProductLabels.rest_nonce`. Label CRUD: `fetchLabels`, `fetchLabel` (single by ID), `createLabel`, `updateLabel`, `deleteLabel`, `reorderLabels`. Also: `fetchOptions`, `saveOptions`, `fetchProducts`, `fetchTaxonomies`, `fetchUsers`, `fetchUserRoles`, `fetchCoupons`
- `queryClient.js` — singleton TanStack Query `QueryClient`
- `helpers.js` — pure utility functions (`generateUUID`, formatters, URL helpers). Use `generateUUID()` for new IDs — do NOT use `crypto.randomUUID()` (empty object in WP admin context)
- `contexts/AppContext.js` — React context wrapping `useReducer`. Fetches options on mount. `handleFormSubmit` routes to label REST API (create/update) when `state.labelMode` is set; otherwise saves styles/settings via WP Settings API. Widget/settings save strips `labels` from payload (sends `{ styles, settings }` only)
- `store/optionsReducer.js` — state shape: `{ options, initialOptions, activeTab, currentLabel, labelMode, isFormChanged, isCancelled, errors, isWidgetOpen }`
- `store/actionTypes.js` — action type constants
- `renderApp.js` — mounts a React component into `#lime-product-labels-root` using `createRoot` (React 18) inside `domReady`. Wraps with `QueryClientProvider → AppProvider → PolarisProvider`. This is the **only** place PolarisProvider lives — do not add it elsewhere.

### Admin UI (`src/admin/`)
React + Shopify Polaris. Entry: `index.js` → imports Polaris CSS + SCSS + `custom.js`, then calls `renderApp(AdminApp)`. `AdminApp.jsx` is the root component (no PolarisProvider — that is in `renderApp.js`). Tabs: Labels, Styles, Settings. `LabelForm.jsx` reads field schema from `window.LimeProductLabels.fields` and renders via `RenderFields.jsx` — adding a new field only requires updating `Fields.php`.

`AdminApp.jsx` gates `<Body/>` behind `loading` from `useAppStore()` — renders `<Loader/>` until `AppContext.fetchData()` resolves. **Do not remove this gate.** Tab components (`TabStyles`, etc.) use `useForm({ initialData: options?.styles })` which calls `useState(initialData)` — if `Body` mounts before options load, `initialData` is `{}` and saved values are lost on reload. `RenderFields.jsx` falls back to `field.default` before `''` so unsaved fields show their PHP-defined defaults.

`custom.js` — runs on `domReady`, calls `setActiveWPMenu(getCurrentTab())` to sync the WP admin submenu highlight with the current tab URL param.

`LabelsTable.jsx` uses **plain React state** (`useState` + `useCallback` + `useEffect`) for the labels list — not TanStack Query. `loadLabels()` fetches via `fetchLabels()` and stores results in local state; all mutations (delete, duplicate, reorder) call `loadLabels()` in `onSuccess`. Duplicate creates the new label then calls `reorderLabels` to place copy after original. Use `generateUUID()` for new IDs. **TanStack Table** handles rendering with `manualPagination: true`. Columns: drag handle, label name, status, actions (equal `1fr` columns). Sorting uses `useMemo` with `sortConfig` dependency — sort logic must be included or clicking column headers has no effect. ReactSortable uses `forceFallback: true` + `fallbackOnBody: true` — required because `getBoundingClientRect()` returns wrong viewport coords in this page layout context, causing the HTML5 drag ghost to anchor at the top of the viewport. `.sortable-fallback` must be a **top-level** CSS selector (not nested inside `.lime-product-labels-sortable`) because `fallbackOnBody` appends the clone to `<body>`. Actions dropdown: `position-relative` must wrap only the three-dot button div, not the outer flex container — otherwise `right: 0` anchors to the far right of the wide 1fr column and the dropdown appears outside the table.

### Frontend (`src/frontend/`)
- `index.js` — stub (Phase 3: badge overlay on product images)

### Localized data
Admin receives `window.LimeProductLabels` via `wp_localize_script`: `fields`, `api_namespace`, `rest_nonce`, `option`, `version`.

### SVGs
SVG files imported in JS/JSX are converted to React components via `@svgr/webpack`. Black/`#000000`/`black` fill values are replaced with `currentColor` automatically.

---

## Key Design Decisions

### Label URL persistence
**Applied in:** `includes/Rest/Controller.php`, `src/core/js/api.js`, `src/core/js/contexts/AppContext.js`

URL params `?tab=labels&label_id=<uuid>` (edit) and `?tab=labels&label_mode=create` (create) persist the current label view so page reload restores state instead of dropping to the labels table.

### Per-product transient cache (future)
`LabelRepository::get_active_labels()` uses a version-keyed transient (`lwpl_active_labels_v{version}`). Version bumped on every label CRUD via `LabelRepository::bump_cache_version()`. Cache version key: `limewoo_lpl_labels_cache_v`.

### Label status toggle
Toggle sends the **full label object** with toggled status — `LabelRepository::update` writes the full `data` JSON column, so a partial payload would corrupt other fields.

### No License, Analytics, Reports
This plugin is free for wp.org. No license checks, no analytics tracking, no reports tab.

### React 18 — always use createRoot
`renderApp.js` uses `createRoot` from `@wordpress/element`. Never use the legacy `render` from `@wordpress/element` — that triggers the React 17 fallback warning in React 18.

### Clone of limewoo-bxgy (stripped)
This plugin is intentionally structured as a near-clone of `limewoo-bxgy`. When adding new UI features, model them on the equivalent bxgy component. Removed from bxgy: License, Updater, Analytics, Reports, UseCases, campaign variants. Renamed: campaigns→labels, widget→styles, `LWBXGY_`→`LWPL_`, `LimewooBXGY`→`LimeProductLabels`, `limewoo_bxgy_`→`limewoo_lpl_`.
