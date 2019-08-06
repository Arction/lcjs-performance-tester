import * as React from 'react'
import { TestResult } from './TestResult';
import { Test } from './TestStructures';
import { List, Set } from 'immutable'

/**
 * TODO: Comments
 */
interface TestResultTableProps {
    /**
     * Results to display.
     */
    results: List<[Test, TestResult]>
    /**
     * Columns to ONLY display.
     */
    columnWhiteList?: Set<TestResultColumn>
}
/**
 * TODO: Comments
 */
export enum TestResultColumn {
    ID,
    Loadup,
    DataGeneration,
    AverageFPS,
    Duration
}
/**
 * TODO: Comments
 */
export const testMeasurementLegend = [
    {
        title: 'Average FPS',
        // tslint:disable-next-line:max-line-length
        content: `FPS is measured using JavaScript API: window.requestAnimationFrame starting from after Chart is first loaded and until the test is completed.`
    },
    {
        title: 'Loadup',
        // tslint:disable-next-line:max-line-length
        content: `Delay between initiating Chart creation to first rendered frame is measured. This logic relies on window.requestAnimationFrame too. For static tests this delay also includes the processing and rendering of all the data`
    },
    {
        title: 'Data generation delay',
        // tslint:disable-next-line:max-line-length
        content: 'Performance tests generate random test data. This processing time is data generation delay.'
    }
]
/**
 * TODO: Comments
 */
export const testResultColumns = [
    {
        id: TestResultColumn.ID,
        header: 'Test ID',
        title: 'ID of test',
        get: ( test: Test, result: TestResult ) =>
            test.key
    },
    {
        id: TestResultColumn.AverageFPS,
        header: 'Average FPS',
        title: 'Average rendered frames per second',
        get: ( test: Test, result: TestResult ) =>
            result.averageFPS !== undefined ?
                result.averageFPS.toFixed( 1 ) : ''
    },
    {
        id: TestResultColumn.Loadup,
        header: 'Loadup (ms)',
        title: 'Delay from creation of chart to first rendered frame (ms)',
        detail: 'Time from initiating Chart creation to first frame. In static tests, includes rendering of initial data',
        get: ( test: Test, result: TestResult ) =>
            result.loadupDelay !== undefined ?
                result.loadupDelay.toFixed( 1 ) : ''
    },
    {
        id: TestResultColumn.DataGeneration,
        header: 'Data generation (ms)',
        title: 'Time used to generate test data (ms)',
        get: ( test: Test, result: TestResult ) =>
            result.dataGenerationDelay !== undefined ?
                result.dataGenerationDelay.toFixed( 1 ) : ''
    },
    {
        id: TestResultColumn.Duration,
        header: 'Duration (s)',
        title: 'Total test duration, including data generation (s)',
        get: ( test: Test, result: TestResult ) =>
            result.duration !== undefined ?
                ( result.duration / 1000 ).toFixed( 1 ) : ''
    }
]
/**
 * TODO: Comments
 */
export default class TestResultTable extends React.PureComponent<TestResultTableProps> {
    /**
     * Reference to TestResultTableContainer for scrolling.
     */
    resultTableContainer: any
    /**
     * Flag keeps track if user is scrolling table.
     * When false, table will be automatically scrolled to show newest test results.
     */
    isUserScrolling: boolean = false
    /**
     * Flag tells scroll event handler to ignore next event.
     * (for disregarding programmatically triggered events).
     */
    ignoreScrollEvent: boolean = false
    /**
     * Hack for having unique keys for repeated tests.
     * Mainly needed because of adding repeated tests upon previous logic which doesn't support it.
     * Ideally we would reform 'TestResult' interface to have an unique property for this.
     */
    uniqueKeyIndex: number = 0

    constructor( props: TestResultTableProps ) {
        super( props )
    }
    componentDidMount() {
        if ( !this.isUserScrolling )
            this.scrollToBottom()
    }
    componentDidUpdate() {
        if ( !this.isUserScrolling )
            this.scrollToBottom()
    }
    scrollToBottom() {
        this.resultTableContainer.scrollTop = this.resultTableContainer.scrollHeight;
        this.ignoreScrollEvent = true
    }
    scrollEventHandler = () => {
        if ( !this.isUserScrolling ) {
            if ( !this.ignoreScrollEvent ) {
                this.isUserScrolling = true
            }
        } else {
            // If user scrolled to bottom -> restore automatic scrolling behaviour.
            if ( this.resultTableContainer.scrollHeight - this.resultTableContainer.scrollTop === this.resultTableContainer.clientHeight )
                this.isUserScrolling = false
        }
        this.ignoreScrollEvent = false
    }
    render() {
        const { results, columnWhiteList } = this.props
        return (
            <div
                className='TestResultTableContainer'
                style={{ flexGrow: 1, display: 'flex', flexDirection: 'row' }}
                onScroll={this.scrollEventHandler}
                ref={( el ) => { this.resultTableContainer = el }}
            >
                {
                    testResultColumns
                        .filter( ( column ) => columnWhiteList === undefined || columnWhiteList.has( column.id ) )
                        .map( ( column, i ) => {
                            return <div
                                className={'TestResultTableColumn' + ( i === 0 ? ' TestResultTableNameColumn' : '' )}
                                key={column.header}
                            >
                                <p
                                    className={'TestResultTableItem TestResultTableHeader' + ( i === 0 ? ' TestResultTableNameItem' : '' )}
                                    title={column.title}
                                >
                                    {column.header}
                                </p>
                                {
                                    results
                                        .map( ( result ) =>
                                            <p
                                                className={
                                                    'TestResultTableItem'
                                                    + ( i === 0 ? ' TestResultTableNameItem' : '' )
                                                    + ( result[1].error ? ' TestResultTableItemError' : '' )
                                                }
                                                key={result[0].key + ':' + column.header + ':' + ( this.uniqueKeyIndex++ )}
                                                title={column.title}
                                            >
                                                {column.get(
                                                    result[0],
                                                    result[1]
                                                )}
                                            </p>
                                        ).toIndexedSeq()
                                }
                            </div>
                        } )
                }
            </div>
        )
    }
}
