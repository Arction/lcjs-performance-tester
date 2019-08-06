const presets = [
    [
        '@babel/preset-env',
        {
            targets: {
                browsers: ['last 2 versions', 'safari >= 7', 'ie >= 10']
            }
        },
        'react'
    ]
]

module.exports = { presets }