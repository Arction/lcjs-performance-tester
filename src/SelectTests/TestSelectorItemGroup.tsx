import * as React from 'react'
import TestSelectorFoldButton from './TestSelectorFoldButton';
import { testSelectorItemTabSize } from './TestSelectorItemTest';
import { Button, ButtonSelector } from '../Shared/Common/Button';

/**
 * TODO: Comments
 */
interface TestSelectorItemGroupProps {
    /**
     * TODO: Comments
     */
    text: string
    /**
     * TODO: Comments
     */
    value: string
    /**
     * TODO: Comments
     */
    collapsed: boolean | undefined
    /**
     * TODO: Comments
     */
    tabs: number
    /**
     * TODO: Comments
     */
    onToggleSelected: () => void
    /**
     * TODO: Comments
     */
    onToggleCollapsed: () => void
}
/**
 * TODO: Comments
 */
export default class TestSelectorItemGroup extends React.PureComponent<TestSelectorItemGroupProps> {
    constructor( props: TestSelectorItemGroupProps ) {
        super( props )
    }
    render(): JSX.Element {
        const { text, value, collapsed, tabs, onToggleSelected, onToggleCollapsed } = this.props
        const isItemGroup = collapsed !== undefined
        return (
            <div>
                <div className='TestSelectorItemRow' style={{ marginLeft: ( tabs * testSelectorItemTabSize ) + 'px', display: 'flex' }}>

                    {
                        isItemGroup &&
                        <TestSelectorFoldButton collapsed={collapsed as boolean} onToggle={onToggleCollapsed} />
                    }
                    <ButtonSelector
                        action={onToggleSelected}
                        title={'Select/Deselect all tests from group'}
                        text={text}
                        value={value}
                        valueClassName='Highlight'
                    />
                </div>
            </div>
        )
    }
}
