import * as React from 'react'
import { testMeasurementLegend } from './TestResultTable';
/**
 * TODO: Comments
 */
export default class MeasurementLegend extends React.PureComponent {
    render() {
        return <div>
            <p className='LegendTitle'>Performance Test Legend</p>
            <ul style={{ marginBlockEnd: '0px', marginBlockStart: '0px' }}>
                {
                    testMeasurementLegend.map( ( item ) =>
                        <li key={item.title} className='LegendTitle'>
                            {item.title}
                            <p className='LegendContent'>{item.content}</p>
                        </li>
                    )
                }
            </ul>
        </div>
    }
}
