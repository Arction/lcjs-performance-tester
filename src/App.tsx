import * as React from 'react'
import '../style/App.css'
import * as ReactDOM from 'react-dom'
import * as data from 'data.js'
import { TestList, Test } from './Common/TestStructures';
import SelectTestsView from './SelectTests/SelectTestsView';
import RunView from './Run/RunView';
import { OrderedSet, List } from 'immutable'

/**
 * Read tests from data.js
 */
const tests = data.getData() as TestList
/**
 * TODO: Comments
 */
type AppState = {
    /**
     * TODO: Comments
     */
    view: 'selectTests',
    autoStart: boolean,
} | {
    /**
     * TODO: Comments
     */
    view: 'run',
    /**
     * TODO: Comments
     */
    selectedTests: List<Test>
    /**
     * TODO: Comments
     */
    testDuration: number
    /**
     * Configured repeat count for tests.
     * 'selectedTests' already contain possible duplicate tests!
     */
    repeatCount: number
}
/**
 * TODO: Comments
 */
const repeatSet = ( set: OrderedSet<Test>, repeatCount: number ) => {
    // TODO: optimize
    let repeated = List()
    for ( let i = 0; i < repeatCount; i++ )
        set.forEach( ( test ) => repeated = repeated.push( test ) )
    return repeated
}
/**
 * Base app
 */
export default class App extends React.PureComponent<{}, AppState> {
    constructor( props: {} ) {
        super( props )
        this.state = {
            view: 'selectTests',
            autoStart: true,
        }
    }
    onRun = ( selectedTests: OrderedSet<Test>, testDuration: number, repeatCount: number ) => {
        const selectedTestCount = selectedTests.size
        if ( selectedTestCount > 0 ) {
            // ----- Switch to RunView -----
            this.setState( {
                view: 'run',
                selectedTests: repeatSet( selectedTests, repeatCount ),
                testDuration,
                repeatCount
            } )
        }
    }
    returnToStartView = () => {
        // ----- Switch to SelectTests -----
        this.setState( {
            view: 'selectTests',
            autoStart: false
        } )
    }
    render() {
        return <div className='App'>
            {
                this.state.view === 'selectTests' ?
                    (
                        <SelectTestsView
                            tests={tests}
                            onRun={this.onRun}
                            autoStart={this.state.autoStart}
                        />
                    )
                    :
                    (
                        'selectedTests' in this.state && <RunView
                            tests={this.state.selectedTests}
                            testDuration={this.state.testDuration}
                            repeatCount={this.state.repeatCount}
                            onReturn={this.returnToStartView}
                        />
                    )
            }
        </div>
    }
}

export const attach = ( elementId: string ) => {
    const target = document.getElementById( elementId )
    // Set background color of the target element to the background color of the app.
    target!.style.backgroundColor = '#202020'

    // remove meta viewport tag that preventes zooming.
    // the tag is added by word press.
    const meta = document
        .querySelector( 'meta[name=viewport]' )
    if ( meta )
        meta.setAttribute( 'content', '' )

    ReactDOM.render( <App />, target )
}
