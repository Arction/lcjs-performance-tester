/**
 * This file is used to stub global object with data that is needed in the tests.
 * Typescript doesn't allow stubbing this way so made with javascript.
 */

/**
 * Setup stubs for codemirror
 */
const stubForCodemirror = () => {
    // Stub createRange to not crash CodeMirror during tests
    global.document.createRange = () => {
        return {
            setEnd: function () { },
            setStart: function () { },
            getBoundingClientRect: function () {
                return { right: 0 }
            },
            getClientRects: function () {
                return {
                    length: 0,
                    left: 0,
                    right: 0
                }
            }
        }
    }
    stubFetch()
    stubTern()
}

/**
 * Stub the fetch function
 */
const stubFetch = () => {
    // Stub window.fetch so that it returns empty object always
    global.window.fetch = () => {
        return Promise.resolve({ json: () => ({}) })
    }
}

/**
 * Setup needed functions for tern
 */
const stubTern = () => {
    // Create stubs for tern server to not crash the tests
    global.tern = global.tern || {}
    global.tern.Server = class Server {
        constructor() { }
    }
}

const orinalUA = global.navigator.userAgent
/**
 * Set the user agent
 * @param {string} userAgent UA string
 */
const setUserAgent = (userAgent) => {
    global.navigator = global.navigator || {}
    Object.defineProperty(global.navigator, 'userAgent', { configurable: true, writable: true, value: userAgent })
}

/**
 * Reset the user agent back to default
 */
const resetUserAgent = () => {
    global.navigator.userAgent = orinalUA
}

const UAStrings = {
    IE: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; McAfee; rv:11.0) like Gecko',
    CHROME: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.84 Safari/537.36',
    EDGE: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
}

/**
 * Set an arbitary global variable
 * @param {string} name Name of the global variable to set
 * @param {any} value Value of the variable
 */
const setGlobal = (name, value) => {
    global[name] = value
}

module.exports = {
    stubForCodemirror,
    stubFetch,
    stubTern,
    setUserAgent,
    resetUserAgent,
    UAStrings,
    setGlobal
}
