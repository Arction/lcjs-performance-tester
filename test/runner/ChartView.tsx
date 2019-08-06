import 'jsdom-global/register'
import * as stubs from '../globalStub.js'
import * as React from 'react'
import { shallow } from 'enzyme'
import ChartView, { ChartViewProps } from '../../src/ChartView'
import { check, expect, equal, exist, greaterThan, contains } from '../tools'
import { testItem1, testItem2, getTestItemsMap, testIndex } from '../testItems'
import Item from '../../src/Item'
import { OrderedMap } from 'immutable'
import { spy, SinonStub, stub, createSandbox } from 'sinon'

describe( '<ChartView />', () => {
    let props: ChartViewProps
    const sandbox = createSandbox()

    const getWrapper = () => {
        return shallow( <ChartView {...props} /> )
    }

    beforeEach( () => {
        // Setup props
        props = {
            exampleCode: testItem1.code || ''
        }
        stubs.setUserAgent( '' )
    } )

    afterEach( () => {
        sandbox.restore()
        stubs.resetUserAgent()
    } )

    describe( 'rendering', () => {
        it( 'should render "div" as the root item and "iframe" has sandbox attribute', () => {
            stubs.setGlobal( 'OWN_DOMAINS', ['http://localhost:8080'] )
            const wrapper = getWrapper()
            equal( wrapper.first().type(), 'div' )
            equal( wrapper.find( 'iframe' ).prop( 'sandbox' ), 'allow-scripts allow-popups' )
        } )

        it( 'should render "iframe" with src on browsers without srcdoc support', () => {
            sandbox.stub( ChartView.prototype, 'supportsSrcDoc' ).returns( false )
            const wrapper = getWrapper()
            exist( wrapper.find( 'iframe' ).prop( 'src' ) )
            exist( !wrapper.find( 'iframe' ).prop( 'srcDoc' ) )
            equal( typeof wrapper.find( 'iframe' ).prop( 'onLoad' ), 'function' )
        } )

        it( 'should render "iframe" with srcdoc on browsers with srcdoc support', () => {
            sandbox.stub( ChartView.prototype, 'supportsSrcDoc' ).returns( true )
            const wrapper = getWrapper()
            exist( !wrapper.find( 'iframe' ).prop( 'src' ) )
            exist( wrapper.find( 'iframe' ).prop( 'srcDoc' ) )
            equal( wrapper.find( 'iframe' ).prop( 'onLoad' ), undefined )
        } )

        it( 'should render "iframe" with src html on IE', () => {
            stubs.setUserAgent( stubs.UAStrings.IE )
            sandbox.stub( ChartView.prototype, 'supportsSrcDoc' ).returns( false )
            const wrapper = getWrapper()
            check( ( wrapper.find( 'iframe' ).prop( 'src' ) as string ).endsWith( '.html' ) )
            equal( typeof wrapper.find( 'iframe' ).prop( 'onLoad' ), 'function' )
            exist( !wrapper.find( 'iframe' ).prop( 'srcDoc' ) )
        } )
    } )

    describe( 'transpile()', () => {
        it( 'should return transpiled code with valid input', () => {
            const wrapper = getWrapper()
            const tr = wrapper.instance() as ChartView
            contains( tr.transpile( 'const x = 0' ), '"use strict";\n\nvar x = 0;' )
        } )

        it( 'should return null with invalid input', () => {
            // Stub console to remove error message that should be logged from displaying in console
            const consoleStub = stub( console, 'error' )
            const wrapper = getWrapper()
            const tr = wrapper.instance() as ChartView
            equal( tr.transpile( 'consasdt x = 0' ), null )
            check( consoleStub.called )
            // Restore normal console behavior
            consoleStub.restore()
        } )

        it( 'should set state if "setState" is not set to false', () => {
            const wrapper = getWrapper()
            const tr = wrapper.instance() as ChartView
            const setStateSpy = spy( tr, 'setState' )
            tr.transpile( 'const x = 0' )
            check( setStateSpy.calledOnce )
        } )

        it( 'should not set state if "setState" is set to false', () => {
            const wrapper = getWrapper()
            const tr = wrapper.instance() as ChartView
            const setStateSpy = spy( tr, 'setState' )
            tr.transpile( 'const x = 0', false )
            check( setStateSpy.notCalled )
        } )
    } )

    describe( 'state', () => {
        let supportsSrcDocStub: SinonStub
        afterEach( () => {
            if ( supportsSrcDocStub ) {
                supportsSrcDocStub.restore()
            }
        } )
        it( 'should set transpiled code to "transpiledCode" state on mount', () => {
            const wrapper = getWrapper()
            contains( wrapper.state( 'transpiledCode' ), '"use strict";\n\nconsole.log("testItem1");' )
        } )

        it( 'should update the transpiled code when the component updates', () => {
            const wrapper = getWrapper()
            contains( wrapper.state( 'transpiledCode' ), '"use strict";\n\nconsole.log("testItem1");' )
            props.exampleCode = 'console.log("updated code")'
            wrapper.setProps( { exampleCode: props.exampleCode } )
            contains( wrapper.state( 'transpiledCode' ), '"use strict";\n\nconsole.log("updated code");' )
        } )

        it( 'should not call refresh on IE when it mounts', () => {
            stubs.setUserAgent( stubs.UAStrings.IE )
            const refreshSpy = sandbox.spy( ChartView.prototype, 'refresh' )
            const wrapper = getWrapper()
            check( refreshSpy.notCalled )
        } )

        it( 'should call refresh on IE when it updates and code changes', () => {
            stubs.setUserAgent( stubs.UAStrings.IE )
            supportsSrcDocStub = sandbox.stub( ChartView.prototype, 'supportsSrcDoc' ).returns( false )
            const refreshSpy = sandbox.spy( ChartView.prototype, 'refresh' )
            const wrapper = getWrapper()
            props.exampleCode = 'console.log("updated code")'
            wrapper.setProps( { exampleCode: props.exampleCode } )
            check( refreshSpy.called )
        } )
    } )

    describe( 'trimTemplate()', () => {
        it( 'should remove whitespace', () => {
            const input = '    test;test2   '
            const expectedOutput = 'test;test2'
            const wrapper = getWrapper()
            const inst = wrapper.instance() as ChartView
            equal( inst.trimTemplate( input ), expectedOutput )
        } )

        it( 'should remove new lines', () => {
            const input = 'test;\n\n\n\n\ntest2'
            const expectedOutput = 'test;test2'
            const wrapper = getWrapper()
            const inst = wrapper.instance() as ChartView
            equal( inst.trimTemplate( input ), expectedOutput )
        } )

        it( 'should remove carriage returns', () => {
            const input = 'test;\r\r\r\r\rtest2'
            const expectedOutput = 'test;test2'
            const wrapper = getWrapper()
            const inst = wrapper.instance() as ChartView
            equal( inst.trimTemplate( input ), expectedOutput )
        } )

        it( 'should remove everything above at same time', () => {
            const input = '    test;\n\r   \n\r\n\r\n\r\r    test2   \n'
            const expectedOutput = 'test;test2'
            const wrapper = getWrapper()
            const inst = wrapper.instance() as ChartView
            equal( inst.trimTemplate( input ), expectedOutput )
        } )
    } )
} )
