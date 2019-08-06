import * as React from 'react'
import { SourceMapConsumer, RawSourceMap } from 'source-map'
import { isIE } from './Common/ie'
/**
 * Chart view props
 */
export interface ChartViewProps {
    /**
     * The example code, will be run inside of an iframe
     */
    exampleCode: string,
    /**
     * Override handler for iFrame error.
     */
    handleError?: ( event: MessageEvent ) => void
}

interface ChartViewState {
    /**
     * Currently used transpiled version of the example code
     */
    transpiledCode: string,
    /**
     * TODO: Comments
     */
    sourceMap?: RawSourceMap,
}

/**
 * Chart view, container for the example chart.
 * @param props Chart view props
 */
export default class ChartView extends React.Component<ChartViewProps, ChartViewState> {
    /**
     * Reference to the iframe that hosts the example
     */
    private iframeRef: React.RefObject<HTMLIFrameElement>

    private readonly useSrc: boolean

    constructor( props: ChartViewProps ) {
        super( props )
        this.useSrc = !this.supportsSrcDoc()

        this.iframeRef = React.createRef()
        this.ieIframeLoad = this.ieIframeLoad.bind( this )
        this.messageHandler = this.messageHandler.bind( this )
        this.state = {
            transpiledCode: this.props.exampleCode
        }
    }
    /**
     * Refresh the iframe
     * @param force Force refresh
     */
    refresh( force: boolean = false ) {
        if ( this.iframeRef.current ) {
            // Setting the source again will reload the iframe
            if ( this.useSrc || force ) {
                this.iframeRef.current.src = this.iframeRef.current.src
                this.iframeRef.current.srcdoc = this.iframeRef.current.srcdoc
            }
        }
    }
    /**
     * Removes extra lines and white space from the template string
     */
    trimTemplate = ( template: string ) =>
        template.replace( /(^\s*|\s*$)/gim, '' ).replace( /\n/g, '' ).replace( /\r/g, '' )

    /**
     * Get the iframe document with the source code embedded
     * @param code The javascript code that will be embedded in the iframe
     * @returns The iframe document
     */
    private getIframeSrcFromTemplate( code: string ): string {
        // Host needed to get the scripts working in Edge
        const host = window.location.origin
        const domain = OWN_DOMAINS.find( ( v ) => v === host )
        // The 'require' function is provided to allow for 'requiring' the library. In reality it just returns the whole
        // library that was loaded before. It only allows for requiring packages that it knows of and it doesn't care if
        // the name is exactly the correct name. E.g. it allows for having the library in different folders and it is still
        // able to detect it.

        // TODO: Add testEvent as prop so we can share ChartView with example-runner?

        let template = `<html><head><style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}
            #chart{width:100%;height:100%}</style></head><body>
            ${isIE() ? `<script src="${host}${CONTENT_BASE_URL}/polyfill.min.js" charset="UTF-8"></script>` : ''}
            <script src="${host}${CONTENT_BASE_URL}/xydata.iife.js" charset="UTF-8"></script>
            <script src="${host}${CONTENT_BASE_URL}/lcjs.iife.js" charset="UTF-8"></script>
            <script>
            window.onerror = function (message, src, line, column, error) {
                if(!error){error = {toString:function(){return ''},stack:''}}
                top.postMessage({
                        type:'iframeError',
                        message:message,
                        line:line,
                        column:column,
                        src:src,
                        error: error.toString(),
                        stack: error.stack
                    }, '${domain ? domain : null}');
            };
            window.require = function(what){
                if(what.indexOf('lcjs')>-1){
                    return lcjs;
                }else if(what.indexOf('xydata')>-1){
                    return xydata;
                }else{
                    return undefined;
                }
            };
            window.testEvent = function(id, params){
                top.postMessage({
                    type:'message',
                    testEventID: id,
                    params: params
                }, '${domain ? domain : null}')
            };
            </script>`.toString()
        // Remove extra padding around each line and remove new line chars
        template = this.trimTemplate( template )
        // Append the transpiled code to the frame
        template += `<script>
        // new MouseEvent polyfill https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent#Polyfill
        (function (window) {
            try {
              new MouseEvent('test');
              return false; // No need to polyfill
            } catch (e) {
                  // Need to polyfill - fall through
            }
              // Polyfills DOM4 MouseEvent
              var MouseEventPolyfill = function (eventType, params) {
                  params = params || { bubbles: false, cancelable: false };
                  var mouseEvent = document.createEvent('MouseEvent');
                  mouseEvent.initMouseEvent(eventType,
                      params.bubbles,
                      params.cancelable,
                      window,
                      0,
                      params.screenX || 0,
                      params.screenY || 0,
                      params.clientX || 0,
                      params.clientY || 0,
                      params.ctrlKey || false,
                      params.altKey || false,
                      params.shiftKey || false,
                      params.metaKey || false,
                      params.button || 0,
                      params.relatedTarget || null
                  );
                  return mouseEvent;
              }
              MouseEventPolyfill.prototype = Event.prototype;
              window.MouseEvent = MouseEventPolyfill;
          })(window);${code}</script></body></html>`
        return template
    }

    /**
     * Generate the iframe data doc
     * @returns Document for the iframe srcDoc attribute
     */
    private createSrcDoc(): string {
        return this.getIframeSrcFromTemplate( this.state.transpiledCode )
    }

    /**
     * Post message event handler.
     * Handles the communication from the chart iframe incase there is an error during runtime
     * @param e Message event
     */
    messageHandler( e: MessageEvent ) {
        const data = e.data
        if ( data && data.type === 'iframeError' ) {
            if ( this.props.handleError ) {
                this.props.handleError( e )
            } else {
                console.log( data )
                const loc = {
                    ch: -1,
                    line: -1
                }
                if ( this.state.sourceMap && data.line > 0 && data.column > 0 ) {
                    // Get the original position from the source map
                    const smConsumer = new SourceMapConsumer( this.state.sourceMap )
                    const origPos = smConsumer.originalPositionFor( {
                        line: data.line,
                        column: data.column
                    } )
                    if ( origPos.line && origPos.column ) {
                        loc.line = origPos.line
                        loc.ch = origPos.column
                    }
                }
            }
        }
    }

    shouldComponentUpdate( nextProps: ChartViewProps, nextState: ChartViewState ) {
        return (
            nextProps.exampleCode !== this.props.exampleCode ||
            nextState.transpiledCode !== this.state.transpiledCode ||
            nextState.sourceMap !== this.state.sourceMap
        )
    }

    componentWillUnmount() {
        window.removeEventListener( 'message', this.messageHandler )
        // Point the iframe to 'about:blank' to clean up resources
        if ( this.iframeRef && this.iframeRef.current && this.iframeRef.current.contentWindow ) {
            this.iframeRef.current.contentWindow.location.href = 'about:blank'
        }
    }

    componentDidUpdate( prevProps: ChartViewProps ) {
        // Transpile the code again if it has changed.
        if ( this.props.exampleCode !== prevProps.exampleCode ) {
            this.setState( { transpiledCode: this.props.exampleCode } )
            if ( this.useSrc ) {
                this.refresh()

            }
        }
    }

    componentDidMount() {
        window.addEventListener( 'message', this.messageHandler )
    }

    /**
     * Chart Iframe load event. Used to send the chart code to the iframe on IE.
     */
    ieIframeLoad() {
        if ( this.iframeRef.current && this.iframeRef.current.contentWindow ) {
            this.iframeRef.current.contentWindow.postMessage( this.createSrcDoc(), '*' )
        }
    }
    /**
     * Returns true if browser suppors srcdoc attribute on iframe
     */
    supportsSrcDoc() { return document.createElement( 'iframe' ).srcdoc !== undefined }

    render() {
        // Use custom ieframe html file on IE and Edge < 18. If the browser doesn't support srcdoc attribute use src datauri
        const src = this.useSrc ? `${window.location.origin}${CONTENT_BASE_URL}/ieframe.html`
            : undefined
        // Use srcdoc attribute if not on IE and browser supports srcdoc
        const srcDoc = this.useSrc ? undefined : this.createSrcDoc()
        return (
            <div className='wrapper Chart'>
                <iframe
                    className='Chart'
                    title='Chart'
                    id='chart'
                    ref={this.iframeRef}
                    src={src}
                    srcDoc={srcDoc}
                    sandbox='allow-scripts allow-popups'
                    width='100%'
                    allowFullScreen
                    onLoad={this.useSrc ? this.ieIframeLoad : undefined}
                />
            </div>
        )
    }
}
