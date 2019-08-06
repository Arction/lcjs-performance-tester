const fs = require('fs')

// Creates the config file template needed to run the runner build.

const template =
    `module.exports = {
    contentBaseUrl: '/dev/master',
    ownDomains: ['http://localhost:8080']
}
`

try {
    // Write the config.js file but don't overwrite the file it it exists
    fs.writeFileSync('config.js', template, { flag: 'wx' })
} catch (e) { if (e.code !== 'EEXIST') console.log(e) }
