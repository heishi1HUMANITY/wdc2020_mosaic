const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    target: 'node',
    output: {
        filename: 'index.js',
        path: path.join(__dirname, 'public/js')
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(sc|c)ss/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            importLoaders: 2
                        },
                    },
                    'sass-loader'
                ]
            }
        ]
    },
    performance: {
        hints: false
    }
};