const fs = require('fs')
const path = require('path')
// /**
//  * @typedef {Object} Project
//  * A project object containing all needed information
//  * @property {string} name internal name
//  * @property {string=} prettyName Display name
//  * @property {string=} markdown Compiled markdown string
//  * @property {number=} index Sorting index
//  * @property {string} projectPath Path to the root of the project
//  * @property {string=} tagName Name of the tag the project is currently at
//  * @property {string=} code Code for the example
//  * @property {string=} externalLink External link to the repository
//  * @property {string[]=} topics Topics from github
//  * @property {string[]=} tags Tags from repository
//  */

/**
 * This module
 */
let g = {}

// Path definitions
const basePath = path.resolve(__dirname, '../content')
const testSrcPath = path.resolve(basePath, 'src')
const dataJsPath = path.resolve(basePath, 'generated', 'data.js')

/**
 * Escape characters that need to escaped.
 * @param   {string}    input   Input string to escape
 * @returns {string}            String safe html string on null
 */
g.makeStringSafe = (input) => {
    if (input === null || input === undefined || typeof input !== 'string') return null
    return input.replace(/\n/g, '\\n').replace(/\r/g, '').replace(/"/g, '\\"')
}

/**
 * Get the code from index.js
 * @param {string} projectPath Path to the project root
 * @returns {string} Contents of the file as safe string
 */
g.getCode = (projectPath) => {
    if (projectPath === null || projectPath === undefined || typeof projectPath !== 'string') return null

    const indexJs = g.findFile(projectPath)
    if (indexJs) {
        try {
            return g.makeStringSafe(fs.readFileSync(indexJs).toString())
        } catch (e) {
            console.error(e)
            return null
        }
    } else {
        return null
    }
}

/**
 * Write the data.js file.
 * @param {string} dataString Data that will be written to the data.js file 
 * @returns {Promise} Empty promise if successfull
 */
g.writeDataJs = (dataString) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path.dirname(dataJsPath))) {
            fs.mkdirSync(path.dirname(dataJsPath))
        }
        fs.writeFile(dataJsPath, dataString, (err) => {
            if (err)
                return reject(err)
            else
                return resolve()
        })
    })
}

/**
 * Get the directories inside of the projects directory
 * @returns {Promise<string[]>} Directories inside of the folder
 */
g.getTestDirs = () => {
    const testPath = testSrcPath + '/tests'
    return new Promise((resolve, reject) => {
        fs.readdir(testPath, (err, files) => {
            if (err) {
                return reject(err)
            } else {
                const contents = files
                    .map(dir => path.join(testPath, dir))
                return resolve(contents)
            }
        })
    })
}
/**
 * 
 */
g.getTestToolsDir = () => {
    const path = testSrcPath + '/tools.js'
    return new Promise((resolve) => {
        return resolve(path)
    })
}
/**
 * Get the code from js file
 * @param {string} sourceFilePath Path to the source file
 * @returns {string} Contents of the file as safe string
 */
g.getCode = (sourceFilePath) => {
    if (sourceFilePath === null || sourceFilePath === undefined || typeof sourceFilePath !== 'string') return null

    if (sourceFilePath) {
        try {
            // TODO: g.makeStringSafe was removed as it seemed to have some problems with tools.js.
            return fs.readFileSync(sourceFilePath).toString()
        } catch (e) {
            console.error(e)
            return null
        }
    } else {
        return null
    }
}
/**
 * Generates string that can be written to the data.js file
 * @param   {string[]}  tests   Test-file strings. (*.js inside content/src/tests)
 * @param   {string}    tools   content/src/tools.js content as string
 */
g.generateDataJs = (tests, tools) => {
    const testsString = tests.reduce((string, testString) =>
        string + testString + '\n'
    )
    const toolsString = tools
    const dataString = `
var data = [];
${toolsString}
${testsString}
module.exports = { getData: () => data };
    `
    return dataString
}


module.exports = g
