import * as React from 'react'
/**
 * TODO: Comments
 */
interface TestSelectorFoldButtonProps {
    /**
     * TODO: Comments
     */
    collapsed: boolean
    /**
     * TODO: Comments
     */
    onToggle: () => void
}
/**
 * TODO: Comments
 */
export default class TestSelectorFoldButton extends React.PureComponent<TestSelectorFoldButtonProps> {
    constructor( props: TestSelectorFoldButtonProps ) {
        super( props )
    }
    render() {
        const { collapsed, onToggle } = this.props
        return (
            <div className='button' onClick={() => onToggle()}>
                <p className='unselectable' style={{ margin: 0 }}>{( collapsed ? '-' : '>' )}</p>
            </div>
        )
    }
}
