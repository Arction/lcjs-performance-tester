const path = require('path')
const name = 'index'
const libName = 'runner'
const config = require('./config')
const webpack = require('webpack')
const babelOptions = require('./babel.config')

module.exports = (env, argv) => {

    const mode = argv.mode === 'production'

    return {
        entry: {
            index: [
                'raf/polyfill.js',
                '@babel/polyfill/dist/polyfill.js',
                'react',
                'react-dom',
                `./${name}.ts`
            ]
        },
        output: {
            filename: libName + '.js',
            library: libName,
            libraryTarget: 'var',
            path: path.resolve() + (mode ? '/dist' : '/dev/master'),
            publicPath: mode ? '/dist' : '/dev/master'
        },
        devtool: mode ? '' : 'inline-source-map',
        mode: mode ? 'production' : 'development',
        plugins: [
            new webpack.DefinePlugin({
                PRODUCTION: JSON.stringify(mode),
                OWN_DOMAINS: JSON.stringify(config.ownDomains),
                CONTENT_BASE_URL: JSON.stringify(config.contentBaseUrl)
            })
        ],
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader'
                },
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    use: 'source-map-loader'
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        },
                        {
                            loader: 'ts-loader'
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        { loader: 'style-loader' },
                        { loader: 'css-loader' }
                    ]
                }
            ]
        },
        resolve: {
            modules: [
                path.resolve('./style'),
                path.resolve('./src'),
                path.resolve('./content/generated'),
                path.resolve('./node_modules')
            ],
            extensions: ['.ts', '.tsx', '.js']
        }
    }
}
