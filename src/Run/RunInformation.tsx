import { makeSafeForCSV } from '../Tools/ExportTools';

// tslint:disable:no-conditional-assignment
// tslint:disable:max-line-length
/**
 * Attempts to read information about used browser type and version.
 * This logic is not supported by js API or any browser standards
 * and is subject to break at any moment or not work already based on browser.
 */
export const browserInformation = () => {
    //https://stackoverflow.com/questions/11219582/how-to-detect-my-browser-version-and-operating-system-using-javascript
    const nAgt = navigator.userAgent;
    let browserName = navigator.appName;
    let fullVersion = '' + parseFloat( navigator.appVersion );
    let majorVersion = parseInt( navigator.appVersion, 10 );
    let nameOffset;
    let verOffset
    let ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ( ( verOffset = nAgt.indexOf( 'Opera' ) ) !== -1 ) {
        browserName = 'Opera';
        fullVersion = nAgt.substring( verOffset + 6 );
        if ( ( verOffset = nAgt.indexOf( 'Version' ) ) !== -1 )
            fullVersion = nAgt.substring( verOffset + 8 );
    } else if ( ( verOffset = nAgt.indexOf( 'MSIE' ) ) !== -1 ) {
        browserName = 'Microsoft Internet Explorer';
        fullVersion = nAgt.substring( verOffset + 5 );
    } else if ( ( verOffset = nAgt.indexOf( 'Chrome' ) ) !== -1 ) {
        browserName = 'Chrome';
        fullVersion = nAgt.substring( verOffset + 7 );
    } else if ( ( verOffset = nAgt.indexOf( 'Safari' ) ) !== -1 ) {
        browserName = 'Safari';
        fullVersion = nAgt.substring( verOffset + 7 );
        if ( ( verOffset = nAgt.indexOf( 'Version' ) ) !== -1 )
            fullVersion = nAgt.substring( verOffset + 8 );
    } else if ( ( verOffset = nAgt.indexOf( 'Firefox' ) ) !== -1 ) {
        browserName = 'Firefox';
        fullVersion = nAgt.substring( verOffset + 8 );
    } else if ( ( nameOffset = nAgt.lastIndexOf( ' ' ) + 1 ) <
        ( verOffset = nAgt.lastIndexOf( '/' ) ) ) {
        browserName = nAgt.substring( nameOffset, verOffset );
        fullVersion = nAgt.substring( verOffset + 1 );
        if ( browserName.toLowerCase() === browserName.toUpperCase() ) {
            browserName = navigator.appName;
        }
    }
    // trim the fullVersion string at semicolon/space if present
    if ( ( ix = fullVersion.indexOf( ';' ) ) !== -1 )
        fullVersion = fullVersion.substring( 0, ix );
    if ( ( ix = fullVersion.indexOf( ' ' ) ) !== -1 )
        fullVersion = fullVersion.substring( 0, ix );

    majorVersion = parseInt( '' + fullVersion, 10 );
    if ( isNaN( majorVersion ) ) {
        fullVersion = '' + parseFloat( navigator.appVersion );
        majorVersion = parseInt( navigator.appVersion, 10 );
    }
    return [
        'Browser name (unreliable),Full version,Major version,appName,userAgent,',
        `${makeSafeForCSV( browserName )},${makeSafeForCSV( fullVersion )},${makeSafeForCSV( majorVersion.toString() )},${makeSafeForCSV( navigator.appName )},${makeSafeForCSV( navigator.userAgent )},`
    ]
}
/**
 * Attempts to read information from users machine.
 * This information should not be stored or uploaded anywhere irresponsibly as it can be considered private.
 */
export const machineInformation = () => {
    // ----- Operating system -----
    //https://stackoverflow.com/questions/11219582/how-to-detect-my-browser-version-and-operating-system-using-javascript
    // This script sets OSName variable as follows:
    // "Windows"    for all versions of Windows
    // "MacOS"      for all versions of Macintosh OS
    // "Linux"      for all versions of Linux
    // "UNIX"       for all other UNIX flavors
    // "Unknown OS" indicates failure to detect the OS
    let OSName = 'Unknown OS';
    if ( navigator.appVersion.indexOf( 'Win' ) !== -1 ) OSName = 'Windows';
    if ( navigator.appVersion.indexOf( 'Mac' ) !== -1 ) OSName = 'MacOS';
    if ( navigator.appVersion.indexOf( 'X11' ) !== -1 ) OSName = 'UNIX';
    if ( navigator.appVersion.indexOf( 'Linux' ) !== -1 ) OSName = 'Linux';

    // ----- Video card -----
    //https://stackoverflow.com/questions/49267764/how-to-get-the-video-card-driver-name-using-javascript-browser-side
    let webglDebugRendererInfo = 'not available'
    try {
        const tempCanvas = document.createElement( 'canvas' )
        const glContext = tempCanvas.getContext( 'webgl' )
        if ( glContext ) {
            const debugInfo = glContext.getExtension( 'WEBGL_debug_renderer_info' )
            if ( debugInfo )
                webglDebugRendererInfo = `Renderer: ${glContext.getParameter( debugInfo.UNMASKED_RENDERER_WEBGL )} Vendor: ${glContext.getParameter( debugInfo.UNMASKED_VENDOR_WEBGL )}`
        }
        // TODO: Can tempCanvas be removed, or is there need to since it is not appended to document.body?
    } catch ( e ) {
        console.log( e )
    }

    return [
        'Operating system (unreliable),WebGL_debug_renderer_info,',
        `${makeSafeForCSV( OSName )},${makeSafeForCSV( webglDebugRendererInfo )},`
    ]
}
