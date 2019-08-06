import * as React from 'react'
import { Test } from 'src/Common/TestStructures';
import { TestResult } from 'src/Common/TestResult';
import { List, Set } from 'immutable'
import { Button } from '../Shared/Common/Button';
import TestResultTable, { testResultColumns, TestResultColumn, testMeasurementLegend } from '../Common/TestResultTable';
import TestRunner from './TestRunner';
import { downloadTextFile, makeSafeForCSV } from '../Tools/ExportTools';
import { browserInformation, machineInformation } from './RunInformation';
import MeasurementLegend from '../Common/MeasurementLegend';

/**
 * TODO: Comments
 */
export interface RunViewProps {
    /**
     * List of tests to run.
     */
    tests: List<Test>
    /**
     * TODO: Comments
     */
    testDuration: number
    /**
     * Repeat count for export file.
     * 'tests' already contain possible duplicated tests!
     */
    repeatCount: number
    /**
     * TODO: Comments
     */
    onReturn: () => void
}
/**
 * TODO: Comments
 */
export interface RunViewState {
    /**
     * TODO: Comments
     */
    pendingTests: List<Test>
    /**
     * TODO: Comments
     */
    testResults: List<[Test, TestResult]>
}
/**
 * Set of TestResult Columns to display while tests are running.
 */
const runningColumnWhiteList: Set<TestResultColumn> = Set( [
    TestResultColumn.ID,
    TestResultColumn.AverageFPS
] )
/**
 * TODO: Comments
 */
const countCompletedTests = ( testResults: List<[Test, TestResult]> ) =>
    testResults.reduce(
        ( count, result ) => count + ( result[1].error ? 0 : 1 ),
        0
    )
/**
 * TODO: Comments
 */
export default class RunView extends React.PureComponent<RunViewProps, RunViewState> {
    /**
     * TODO: Comments
     */
    readonly timeStart = window.performance.now()
    /**
     * Hacky hack to make code always unique.
     */
    private uniqueIndex = 0

    constructor( props: RunViewProps ) {
        super( props )
        this.state = {
            pendingTests: props.tests,
            testResults: List()
        }
    }
    onStop = () => {
        this.setState( {
            pendingTests: List()
        } )
    }
    onTestCompleted = ( test: Test, result: TestResult ) => {
        this.setState( {
            pendingTests: this.state.pendingTests.splice( this.state.pendingTests.indexOf( test ), 1 ),
            testResults: this.state.testResults.push( [test, result] )
        } )
    }
    onTestFailed: ( test: Test, result: Partial<TestResult> ) => void = this.onTestCompleted
    exportCSV = () => {
        // Construct csv formated string from testResults and any information we can grab from the environment.
        let csv = ''
        // Append UTF-8 BOM. https://stackoverflow.com/questions/27802123/utf-8-csv-encoding
        csv += String.fromCharCode( 0xFEFF )

        // Separate sections by custom separator, mainly to provide some semi-decent way of parsing the result automatically.
        // 20 * characters.
        const sectionSeparator = '********************'
        const newLine = '\r\n'

        // ----- Environment information -----
        const environmentInformation = ['', '']
        // Date time.
        const dateTimeInfo = new Date().toLocaleString()
        environmentInformation[0] += 'Date-time,'
        environmentInformation[1] += makeSafeForCSV( dateTimeInfo ) + ','

        // Operating system.
        const operatingSystemInfo = machineInformation()
        environmentInformation[0] = environmentInformation[0].concat( operatingSystemInfo[0] )
        environmentInformation[1] = environmentInformation[1].concat( operatingSystemInfo[1] )

        // Browser.
        const browserInfo = browserInformation()
        environmentInformation[0] = environmentInformation[0].concat( browserInfo[0] )
        environmentInformation[1] = environmentInformation[1].concat( browserInfo[1] )

        // Test duration setting.
        const testDuration = this.props.testDuration
        environmentInformation[0] += 'Test duration (s),'
        environmentInformation[1] += makeSafeForCSV( testDuration.toString() ) + ','

        // Test repeat setting
        const repeatCount = this.props.repeatCount
        environmentInformation[0] += 'Repeat count,'
        environmentInformation[1] += makeSafeForCSV( repeatCount.toString() ) + ','

        csv += environmentInformation[0] + newLine + environmentInformation[1] + newLine + newLine + sectionSeparator + newLine

        // ----- Measurement legend -----
        csv += 'Performance Test Legend >>>>>'
        // Put fake columns before legend rows, so that they don't align with other columns (Because legend has really long lines).
        let fakeColumns = ''
        const columnAmountSoFar = environmentInformation[0].split( ',' ).length - 1
        while ( fakeColumns.length < columnAmountSoFar )
            fakeColumns += ','

        for ( const item of testMeasurementLegend )
            csv += fakeColumns + item.content + newLine
        csv += newLine
        csv += sectionSeparator + newLine

        // ----- Test results -----
        const results = this.state.testResults
        const columns = testResultColumns
        columns.forEach( ( column, ci ) =>
            csv += column.header + ( ci < columns.length - 1 ? ',' : '' )
        )
        csv += newLine
        results.forEach( ( result ) => {
            columns.forEach( ( column, ci ) =>
                csv += column.get( result[0], result[1] ) + ( ci < columns.length - 1 ? ',' : '' )
            )
            csv += newLine
        } )

        // Prompt download for csv file.
        downloadTextFile( 'testResults.csv', csv )
    }
    render() {
        const { tests, testDuration, onReturn } = this.props
        const { pendingTests, testResults } = this.state

        const activeTest = pendingTests.first( undefined )
        const columnWhiteList = activeTest ? runningColumnWhiteList : undefined

        return <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: activeTest ? '250px' : 'calc(50vw)' }}>
                <div className='TestRunHeader'>
                    <p className='DescriptionTitle'>
                        {
                            ( activeTest ?
                                'Running tests' + ' (' + ( testResults.size + 1 ) + '/' + tests.size + ')'
                                :
                                'Completed ' + countCompletedTests( testResults ) + '/' + tests.size +
                                ' tests (' + Math.round( ( window.performance.now() - this.timeStart ) / ( 60 * 1000 ) ) + ' mins)'
                            )
                        }
                    </p>
                    {
                        activeTest && <p className='ActiveTest Highlight'>
                            {activeTest.key}
                        </p>
                    }
                    {
                        !activeTest && <div>
                            <Button
                                text='Export .csv'
                                title='Download results in csv-format'
                                action={this.exportCSV}
                            />
                            <Button
                                text='Return'
                                title='Return to start view'
                                action={onReturn}
                            />
                        </div>
                    }
                    {
                        activeTest && <Button
                            text='Stop'
                            title='Stop running tests and show results so far'
                            action={this.onStop}
                        />
                    }
                </div>
                <TestResultTable
                    results={testResults}
                    columnWhiteList={columnWhiteList}
                />
            </div>
            {
                activeTest && <TestRunner
                    test={activeTest}
                    testDuration={testDuration}
                    onTestCompleted={( result ) => this.onTestCompleted( activeTest, result )}
                    onTestFailed={( result ) => this.onTestFailed( activeTest, result )}
                    uniqueIndex={this.uniqueIndex++}
                />
            }
            {
                !activeTest && <MeasurementLegend />
            }
        </div>
    }
}
