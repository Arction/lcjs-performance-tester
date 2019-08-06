declare module 'data.js' {
    function getData(): object
}
/**
 * Webpack defined constant indicating production environment
 */
declare const PRODUCTION: boolean
/**
 * Webpack defined constant holding the site domains
 */
declare const OWN_DOMAINS: string[]
/**
 * Webpack defined constant holding the base url for all data that is requested separately.
 */
declare const CONTENT_BASE_URL: string
