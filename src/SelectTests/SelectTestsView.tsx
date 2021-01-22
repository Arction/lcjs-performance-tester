import * as React from 'react'
import TestSelector from './TestSelector';
import { TestList, Test } from 'src/Common/TestStructures';
import { OrderedSet } from 'immutable'
import MeasurementLegend from '../Common/MeasurementLegend';

/**
 * TODO: Comments
 */
export interface SelectTestsViewProps {
    /**
     * TODO: Comments
     */
    tests: TestList
    /**
     * TODO: Comments
     */
    onRun: ( selectedTests: OrderedSet<Test>, testDuration: number, repeatCount: number ) => void

    autoStart: boolean
}
/**
 * TODO: Comments
 */
export default class SelectTestsView extends React.PureComponent<SelectTestsViewProps> {
    constructor( props: SelectTestsViewProps ) {
        super( props )
    }
    render() {
        const { tests, onRun } = this.props

        return <div className='SelectTestContainer ScrollContainer scroll-y'>
            <div style={{ flexDirection: 'row', display: 'flex' }}>
                <div style={{ minWidth: 'calc(50vw)' }}>
                    <p className='DescriptionTitle'>LightningChart® JS performance tester</p>
                    <ul>
                        <li className='DescriptionContent'>
                            Select desired tests to run from below
                        </li>
                        <li className='DescriptionContent'>
                            Duration of each test can be configured by clicking on 'Test duration'-Button
                        </li>
                        <li className='DescriptionContent'>
                            Tests can be run multiple times by clicking on 'Repeat count'-Button
                        </li>
                        <li className='DescriptionContent'>
                            Click 'Run'
                        </li>
                        <li className='DescriptionContent'>
                            For best results, refrain from using device
                        </li>
                        <li className='DescriptionContent'>
                            Tests will be run sequentially
                        </li>
                        <li className='DescriptionContent'>
                            After tests are completed, results can be seen and exported to .csv-format
                        </li>
                    </ul>
                </div>
                <div>
                    <MeasurementLegend
                        style={{marginLeft: '16px'}}
                    ></MeasurementLegend>
                </div>
            </div>
            <div>
                <TestSelector
                    tests={tests}
                    onRun={onRun}
                    autoStart={this.props.autoStart}
                />
            </div>
        </div>
    }
}
