
/**
 * Prompts user to download a text file.
 */
export const downloadTextFile = ( filename: string, text: string ) => {
    if ( window.navigator.msSaveOrOpenBlob ) {
        const blob = new Blob( [text], { type: 'text/plain;charset=utf-8;' } );
        window.navigator.msSaveOrOpenBlob( blob, filename )
    } else {
        const element = document.createElement( 'a' );
        element.setAttribute( 'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( text ) );
        element.setAttribute( 'download', filename );

        element.style.display = 'none';
        document.body.appendChild( element );

        element.click();

        document.body.removeChild( element );
    }
}

export const makeSafeForCSV = (s: string) => s.replace(',', '.')
