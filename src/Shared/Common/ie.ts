
/**
 * Returns true if browser is IE
 */
export const isIE = ( userAgent?: string ): boolean => {
    const ua = userAgent || window.navigator.userAgent
    const msie = ua.indexOf( 'MSIE ' )
    const trident = ua.indexOf( 'Trident/' )
    return ( msie > 0 || trident > 0 )
}
