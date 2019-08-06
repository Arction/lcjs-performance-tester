import * as React from 'react'
import { ButtonCheckable } from '../Shared/Common/Button';

/**
 * TODO: Comments
 */
interface TestSelectorItemTestProps {
    /**
     * TODO: Comments
     */
    text: string
    /**
     * TODO: Comments
     */
    selected: boolean
    /**
     * TODO: Comments
     */
    tabs: number
    /**
     * TODO: Comments
     */
    onToggleSelected: () => void
}
/**
 * TODO: Comments
 */
export default class TestSelectorItemTest extends React.PureComponent<TestSelectorItemTestProps> {
    constructor( props: TestSelectorItemTestProps ) {
        super( props )
    }
    render(): JSX.Element {
        const { text, selected, tabs, onToggleSelected } = this.props
        return (
            <div>
                <div className='TestSelectorItemRow' style={{ marginLeft: ( tabs * testSelectorItemTabSize ) + 'px', display: 'flex' }}>
                    <ButtonCheckable
                        action={onToggleSelected}
                        title={'Select whether test should be included or not'}
                        text={text}
                        checkState={selected}
                        checkBoxClassName='Highlight'
                    />
                </div>
            </div>
        )
    }
}
/**
 * Size of tab increment in TestSelector list (left margin)
 */
export const testSelectorItemTabSize = 45;
