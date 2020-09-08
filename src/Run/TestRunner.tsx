import * as React from 'react'
import { TestResult } from 'src/Common/TestResult';
import { Test } from 'src/Common/TestStructures';
import ChartView from '../Shared/ChartView';
import { Set } from 'immutable'

/**
 * TODO: Comments
 */
export interface TestRunnerProps {
    /**
     * TODO: Comments
     */
    test: Test
    /**
     * TODO: Comments
     */
    testDuration: number
    /**
     * TODO: Comments
     */
    onTestCompleted: ( result: TestResult ) => void
    /**
     * TODO: Comments
     */
    onTestFailed: ( result: Partial<TestResult> ) => void
    /**
     * Hacky hack for running same test code multiple times.
     */
    uniqueIndex: number
}
/**
 * TODO: Comments
 */
export interface TestRunnerState {
    /**
     * TODO: Comments
     */
    isGeneratingData: boolean
}
/**
 * Identifiers for test messages. These are always sent from the test code and read here in TestRunner.
 */
export const TestEventID = {
    /**
     * TODO: Comments
     */
    START_TEST_CODE: 'start',
    /**
     * TODO: Comments
     */
    START_DATA_GENERATION: 'start_data_gen',
    /**
     * TODO: Comments
     */
    FINISH_DATA_GENERATION: 'finish_data_gen',
    /**
     * TODO: Comments
     */
    INITIALIZE_CHART: 'init_chart',
    /**
     * TODO: Comments
     */
    FIRST_FRAME: 'first_frame',
    /**
     * TODO: Comments
     */
    RECORD_AVERAGE_FPS: 'record_averageFPS',
    /**
     * TODO: Comments
     */
    TEST_COMPLETED: 'test_completed',
    /**
     * TODO: Comments
     */
    TEST_ERROR: 'test_error'
}
/**
 * TODO: Comments
 */
export default class TestRunner extends React.PureComponent<TestRunnerProps, TestRunnerState> {
    /**
     * TODO: Comments
     */
    result: Partial<TestResult> = {}
    /**
     * TODO: Comments
     */
    tStartTest?: number
    /**
     * TODO: Comments
     */
    tStartDataGeneration?: number
    /**
     * TODO: Comments
     */
    tInitializeChart?: number

    constructor( props: TestRunnerProps ) {
        super( props )
        this.state = {
            isGeneratingData: false
        }
    }
    componentDidMount() {
        window.addEventListener( 'message', this.testMessageHandler )
    }
    componentWillUnmount() {
        window.removeEventListener( 'message', this.testMessageHandler )
    }
    UNSAFE_componentWillReceiveProps() {
        this.result = {}
    }
    handleError() {
        this.result.error = true
        this.props.onTestFailed( this.result )
    }
    testMessageHandler = ( event: MessageEvent ) => {
        const { testEventID, params } = event.data
        switch ( testEventID ) {
            case TestEventID.START_TEST_CODE:
                this.tStartTest = params.time
                break
            case TestEventID.START_DATA_GENERATION:
                this.tStartDataGeneration = params.time
                this.setState( {
                    isGeneratingData: true
                } )
                break
            case TestEventID.FINISH_DATA_GENERATION:
                if ( this.tStartDataGeneration ) {
                    this.result.dataGenerationDelay = params.time - this.tStartDataGeneration
                    this.setState( {
                        isGeneratingData: false
                    } )
                } else
                    throw new Error( 'Received finish data generation event before respective start event' )
                break
            case TestEventID.INITIALIZE_CHART:
                this.tInitializeChart = params.time
                break
            case TestEventID.FIRST_FRAME:
                if ( this.tInitializeChart )
                    this.result.loadupDelay = params.time - this.tInitializeChart
                else
                    throw new Error( 'Received first frame event before chart initialization event' )
                break
            case TestEventID.RECORD_AVERAGE_FPS:
                this.result.averageFPS = params.averageFPS
                break
            case TestEventID.TEST_COMPLETED:
                if ( this.tStartTest )
                    this.result.duration = params.time - this.tStartTest
                else
                    throw new Error( 'Received test completed event before test start event' )

                const testIdentifierPart = ' (' + this.props.test.key + ')'
                // Check result properties.
                if ( this.result.loadupDelay === undefined )
                    console.log( 'Noncritical error: Didn\'t receive loadup delay', testIdentifierPart )
                if ( this.result.dataGenerationDelay === undefined )
                    console.log( 'Noncritical error: Didn\'t receive data generation delay', testIdentifierPart )
                if ( this.result.averageFPS === undefined )
                    console.log( 'Noncritical error: Didn\'t receive average FPS recording', testIdentifierPart )
                if ( this.result.duration === undefined )
                    console.log( 'Noncritical error: Didn\'t receive test duration', testIdentifierPart )
                if ( this.result.error === true )
                    console.log( 'Noncritical error: Attempted to complete test that reported an error', testIdentifierPart )
                this.props.onTestCompleted( this.result as TestResult )
                break
            case TestEventID.TEST_ERROR:
                this.handleError()
                break
            case undefined:
                break
            default:
                throw new Error( 'Unhandled test message ID: ' + testEventID )
        }
    }
    render() {
        const { test, testDuration, uniqueIndex } = this.props
        const { isGeneratingData } = this.state
        return (
            <div className='TestChart'>
                {
                    isGeneratingData && <p className='TestStateLabel'>
                        Generating test data...
                    </p>
                }
                <ChartView
                    exampleCode={`
                        window.testDuration = ${testDuration * 1000};\n
                        var abcabcabc=${uniqueIndex};\n
                        ${test.code}
                    `}
                    handleError={() => this.handleError()}
                />
            </div>
        )
    }
}
