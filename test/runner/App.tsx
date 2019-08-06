import 'jsdom-global/register'
import { configure as enzymeConfigure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react'
import { shallow } from 'enzyme'
import App, { AppProps, MatchParams } from '../../src/App'
import { check, expect, equal, exist, greaterThan } from '../tools'
import { testItem1, testItem2, testIndex, getTestItemsMap } from '../testItems'
import Item from '../../src/Item'
import { OrderedMap } from 'immutable'
import { sandbox, createSandbox, SinonStub } from 'sinon'
import { History, Location } from 'history'
import { match } from 'react-router'
import * as data from 'data.js'

enzymeConfigure( { adapter: new Adapter() } );

describe( '<App />', () => {
    let props: AppProps

    const getWrapper = () => {
        return shallow( <App {...props} /> )
    }
    const sandbox = createSandbox()
    beforeEach( () => {
        sandbox.reset()
        sandbox.stub( data, 'getData' ).returns( { testItem1, testItem2, index: testIndex } )
        // Setup props
        props = {
            history: {} as History,
            location: {} as Location,
            match: {
                params: {
                    item: ''
                }
            } as match<MatchParams>
        }
    } )

    afterEach( () => {
        ( data.getData as SinonStub ).restore()
        sandbox.reset()
    } )

    it( 'should render "div" as the root item', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().type(), 'div' )
    } )

    it( 'should render "SideBar, ContentView" elements', () => {
        const wrapper = getWrapper()
        equal( wrapper.find( 'Sidebar' ).length, 1 )
        equal( wrapper.find( 'ContentView' ).length, 1 )
    } )

    it( 'should select "index" as default item', () => {
        const wrapper = getWrapper()
        const inst = wrapper.instance() as App
        equal( inst.getSelectedItem(), testIndex )
    } )

    it( 'should select "testItem1" with route /testItem1', () => {
        props.match.params.item = 'testItem1'
        const wrapper = getWrapper()
        const inst = wrapper.instance() as App
        equal( inst.getSelectedItem(), testItem1 )
    } )
} )
