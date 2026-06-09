const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const CopyPlugin = require( 'copy-webpack-plugin' );

const srcDir = path.resolve( __dirname, 'src' );
const buildDir = path.resolve( __dirname, 'build' );
const coreDir = path.join( srcDir, 'core' );
const adminDir = path.join( srcDir, 'admin' );
const frontendDir = path.join( srcDir, 'frontend' );
const adminImagesDir = path.join( adminDir, 'images' );
const frontendImagesDir = path.join( frontendDir, 'images' );

const publicPath = '/wp-content/plugins/lime-product-labels/build/';

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'admin/index': path.resolve( adminDir, 'js/index.js' ),
		'frontend/index': path.resolve( frontendDir, 'js/index.js' ),
	},
	output: {
		...defaultConfig.output,
		path: buildDir,
		publicPath: publicPath,
		filename: ( pathData ) => {
			if (
				pathData.chunk?.name?.startsWith( 'blocks/' ) &&
				typeof defaultConfig.output.filename === 'function'
			) {
				return defaultConfig.output.filename( pathData );
			}
			return '[name].js';
		},
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			'@core': path.resolve( coreDir ),
			'@coreJS': path.resolve( coreDir, 'js' ),
			'@admin': path.resolve( adminDir, 'js' ),
			'@frontend': path.resolve( frontendDir, 'js' ),
			'@adminImages': adminImagesDir,
			'@frontendImages': frontendImagesDir,
		},
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules
				.map( ( rule ) => {
					if ( rule.test && rule.test.toString().includes( 'svg' ) ) {
						return {
							...rule,
							test: /\.(png|jpe?g|gif|webp)$/i,
						};
					}
					return rule;
				} ),
			{
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: [
					{
						loader: '@svgr/webpack',
						options: {
							svgo: true,
							svgoConfig: {
								plugins: [
									{
										name: 'preset-default',
										params: {
											overrides: {
												removeViewBox: false,
											},
										},
									},
								],
							},
							dimensions: true,
							replaceAttrValues: {
								'#000': 'currentColor',
								'#000000': 'currentColor',
								'black': 'currentColor',
							},
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif|webp)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'images/[name][ext]',
				},
			},
		],
	},
	plugins: [
		...( defaultConfig.plugins || [] ),
		new CopyPlugin( {
			patterns: [
				{
					from: adminImagesDir,
					to: path.join( buildDir, 'images' ),
					noErrorOnMissing: true,
				},
				{
					from: frontendImagesDir,
					to: path.join( buildDir, 'images' ),
					noErrorOnMissing: true,
				},
			],
		} ),
	],
	performance: {
		hints: false,
	},
};
