import * as React from 'react'
import { TestList, TestItem, TestGroup, isGroup, Test } from '../Common/TestStructures';
import { Map, OrderedSet, OrderedMap } from 'immutable'
import TestSelectorItemGroup from './TestSelectorItemGroup';
import TestSelectorItemTest from './TestSelectorItemTest';
import { Button, ButtonSelector } from '../Shared/Common/Button';

interface TestSelectorProps {
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
interface TestSelectorState {
    /**
     * TODO: Comments
     */
    testDurationSelectionIndex: number
    /**
     * TODO: Comments
     */
    repeatCountSelectionIndex: number
    /**
     * TODO: Comments
     */
    selections: OrderedMap<TestItem, boolean>
    /**
     * TODO: Comments
     */
    collapsions: Map<TestGroup, boolean>
    /**
     * Starting default tests automatically in n seconds.
     */
    autoStartIn: number | undefined
}
/**
 * TODO: Comments
 */
const testDurationOptions = [
    5,
    10,
    30,
    60,
    300,
    1,
    3
]
/**
 * TODO: Comments
 */
const repeatCountOptions = [
    1, 2, 3, 5, 10, 25
]
/**
 * TODO: Comments
 */
const mapTestListRecursively = <T extends any>(
    testList: TestList,
    clbk: ( testItem: TestItem ) => T | undefined
): OrderedMap<TestItem, T> => {
    const values: [TestItem, T][] = []
    const iterate = ( items: TestItem[] ) => {
        items.forEach( ( item ) => {
            const value = clbk( item )
            if ( value !== undefined )
                values.push( [item, value] )
            if ( 'members' in item )
                iterate( item.members )
        } )
    }
    iterate( testList )
    return OrderedMap( values )
}
/**
 * TODO: Comments
 */
export default class TestSelector extends React.PureComponent<TestSelectorProps, TestSelectorState> {
    onUnmount: Array<() => unknown> = []
    
    constructor( props: TestSelectorProps ) {
        super( props )
        // Map initial state from TestItems.
        const { tests } = props
        let selections = mapTestListRecursively( tests, ( test ) => true )
        const collapsions = mapTestListRecursively( tests, ( test ) =>
            isGroup( test ) ?
                (
                    test.defaultCollapsed !== undefined ?
                        test.defaultCollapsed :
                        false
                ) :
                undefined
        ) as Map<TestGroup, boolean>

        // Hacky hack for default selections.
        mapTestListRecursively( tests, ( test ) => {
            if ( test.defaultSelected !== undefined )
                selections = this.setItemSelected( test, test.defaultSelected, selections )
        } )

        this.state = {
            testDurationSelectionIndex: 6,
            repeatCountSelectionIndex: 2,
            selections,
            collapsions,
            autoStartIn: this.props.autoStart ? 5 : undefined
        }
    }
    componentDidMount() {
        if (this.props.autoStart) {
            let handle: number | undefined
            const tStart = Date.now()
            const updateAutoStartCounter = () => {
                if ( this.state.autoStartIn === undefined || this.state.autoStartIn === 0 ) return
                const autoStartIn = Math.ceil(5 - (Date.now() - tStart) / 1000)
                if (autoStartIn !== this.state.autoStartIn) {
                    this.setState({ autoStartIn })
                    if (autoStartIn === 0) {
                        // Auto-start default tests.
                        this.onClickRun()
                    }
                }
                handle = requestAnimationFrame(updateAutoStartCounter)
            }
            handle = requestAnimationFrame(updateAutoStartCounter)
            this.onUnmount.push(() => handle && cancelAnimationFrame(handle))
        }
    }
    componentWillUnmount() {
        this.onUnmount.forEach((clbk) => clbk())
        this.onUnmount.length = 0
    }
    setItemSelected = ( item: TestItem, selected: boolean, selections: OrderedMap<TestItem, boolean> ) => {
        // Toggle item selection.
        const setSelected = ( nItem: TestItem ) => {
            selections = selections.set( nItem, selected )
            if ( isGroup( nItem ) )
                nItem.members.forEach( setSelected )
        }
        setSelected( item )

        // Check for impossible group states.
        const checkItem = ( testItem: TestItem ) => {
            if ( isGroup( testItem ) ) {
                // First recurse through its members for correct logic.
                testItem.members.forEach( checkItem )
                // Then check state according to members selections count.
                const selectedCount = testItem.members.reduce( ( sum, member ) => sum + ( selections.get( member ) === true ? 1 : 0 ), 0 )

                const isSelected = selections.get( testItem )
                if ( selectedCount === testItem.members.length ) {
                    // All members are selected, so group should also be selected.
                    if ( isSelected === false )
                        selections = selections.set( testItem, true )
                } else {
                    // Not all members are selected, so group should not be selected.
                    if ( isSelected === true )
                        selections = selections.set( testItem, false )
                }
            }
        }
        this.props.tests.forEach( checkItem )
        return selections
    }
    onToggleSelected = ( item: TestItem ) => {
        // Toggle item selection.
        this.setState( {
            selections: this.setItemSelected( item, !this.state.selections.get( item ), this.state.selections ),
            // Disable auto start.
            autoStartIn: undefined
        } )
    }
    onToggleCollapsed = ( item: TestGroup ) => {
        this.setState( {
            collapsions: this.state.collapsions
                .set(
                    item,
                    !this.state.collapsions.get( item )
                )
        } )
    }
    onClickRun = () => {
        const { onRun } = this.props
        const { selections, testDurationSelectionIndex, repeatCountSelectionIndex } = this.state
        onRun(
            OrderedSet(
                (
                    selections
                        // Filter only selected Tests (don't include groups!).
                        .filter( ( selected, test ) => selected && !isGroup( test ) ) as OrderedMap<Test, boolean>
                )
                    .toArray()
                    .map( ( tuple ) => tuple[0] )
            ),
            testDurationOptions[testDurationSelectionIndex],
            repeatCountOptions[repeatCountSelectionIndex]
        )
    }
    onClickTestDuration = () => {
        const nextIndex = this.state.testDurationSelectionIndex + 1
        this.setState( {
            testDurationSelectionIndex: nextIndex < testDurationOptions.length ? nextIndex : 0,
            // Disable auto start.
            autoStartIn: undefined
        } )
    }
    onClickRepeatCount = () => {
        const nextIndex = this.state.repeatCountSelectionIndex + 1
        this.setState( {
            repeatCountSelectionIndex: nextIndex < repeatCountOptions.length ? nextIndex : 0,
            // Disable auto start.
            autoStartIn: undefined
        } )
    }
    reduceSelectedItems = ( prev: { count: number, available: number }, item: TestItem ) => {
        if ( !isGroup( item ) ) {
            if ( this.state.selections.get( item ) === true )
                prev.count++
            prev.available++
        } else
            item.members.reduce( this.reduceSelectedItems, prev )
        return prev
    }
    renderGroup = ( group: TestGroup, tabs = 0 ): JSX.Element => {
        const isSelected = this.state.selections.get( group ) as boolean
        const isCollapsed = this.state.collapsions.get( group ) as boolean

        // Find amount of nested selected items.
        const nestedSelects = group.members.reduce( this.reduceSelectedItems, { count: 0, available: 0 } )
        return <div key={group.key}>
            <TestSelectorItemGroup
                text={group.label + ' '}
                value={'(' + String( nestedSelects.count ) + '/' + String( nestedSelects.available ) + ')'}
                collapsed={isCollapsed}
                tabs={tabs}
                onToggleSelected={() => this.onToggleSelected( group )}
                onToggleCollapsed={() => this.onToggleCollapsed( group )}
            />
            {
                isCollapsed && group.members.map(
                    ( member ) => this.renderItem( member, tabs + 1 )
                )
            }
        </div>
    }
    renderTest = ( test: TestItem, tabs = 0 ): JSX.Element => {
        const isSelected = this.state.selections.get( test ) as boolean

        return <TestSelectorItemTest
            key={test.key}
            text={test.label}
            selected={isSelected}
            tabs={tabs}
            onToggleSelected={() => this.onToggleSelected( test )}
        />
    }
    renderItem = ( item: TestItem, tabs = 0 ): JSX.Element =>
        isGroup( item ) ? this.renderGroup( item, tabs ) : this.renderTest( item, tabs )
    render() {
        const { tests } = this.props
        const { testDurationSelectionIndex, repeatCountSelectionIndex, autoStartIn } = this.state

        const selectedTestDuration = testDurationOptions[testDurationSelectionIndex]
        const selectedRepeatCount = repeatCountOptions[repeatCountSelectionIndex]

        // Count all selected items count.
        const selectedTestCount = tests.reduce( this.reduceSelectedItems, { count: 0, available: 0 } )

        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className='TestListHeader'>{
                        'Tests (' + String( selectedTestCount.count ) + '/' + String( selectedTestCount.available ) + '' +
                        ' ≃ ' + estimateTestDuration( selectedTestCount.count, selectedTestDuration, selectedRepeatCount ) + ' min)'
                    }</p>
                    <ButtonSelector
                        text={'Test duration: '}
                        value={selectedTestDuration.toFixed( 0 ) + 's'}
                        valueClassName='Highlight'
                        title='This duration is known in tests and can affect how they behave and their results'
                        action={this.onClickTestDuration}
                    />
                    <ButtonSelector
                        text={'Repeat count: '}
                        value={selectedRepeatCount.toFixed( 0 )}
                        valueClassName='Highlight'
                        title='Test suite will be run this many times'
                        action={this.onClickRepeatCount}
                    />
                    <Button
                        text='Run tests'
                        title='Run selected tests'
                        action={this.onClickRun}
                        className='RunButton'
                    />
                    <Button
                        action='https://github.com/Arction/lcjs-performance-tester'
                        title='Open project in GitHub'
                        text='Open project in GitHub'
                    />
                </div>
                <nav className='TestList' >
                    <div>
                        {
                            tests.map( ( item ) => this.renderItem( item ) )
                        }
                    </div>
                </nav>
                <div className={'AutoStartDiv' + (autoStartIn === undefined || autoStartIn <= 0 ? ' AutoStartDiv-hidden' : '')}
                    onClick={() => this.setState({ autoStartIn: undefined })}
                >
                    {autoStartIn === undefined ? 'Cancelled' : `Starting tests in ${autoStartIn}...`}
                </div>
            </div>
        )
    }
}
/**
 * Estimate test duration in minutes.
 */
const estimateTestDuration = ( testAmount: number, testDuration: number, repeatCount: number ): number =>
    Math.round( testAmount * ( testDuration + 0.300 ) * repeatCount * 1.1 / 60 )
