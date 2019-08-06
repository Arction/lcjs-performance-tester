import * as React from 'react'
import { shallow } from 'enzyme'
import { Button, ButtonProps, ButtonNavLink, ButtonNavLinkProps, ButtonCheckable, ButtonCheckableProps } from '../../../src/Common/Button'
import { check, expect, equal, exist, greaterThan } from '../../tools'
import { testItem1, testItem2, getTestItemsMap } from '../../testItems'
import Item from '../../../src/Item'
import { OrderedMap } from 'immutable'
import { spy, SinonSpy } from 'sinon'

describe( '<Button />', () => {
    let props: ButtonProps<HTMLButtonElement>

    const getWrapper = () => {
        return shallow( <Button {...props} /> )
    }

    beforeEach( () => {
        // Setup props
        props = {
            text: 'test button',
            title: 'test title'
        }
    } )

    it( 'should always render prop text as child and title as title.', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().prop( 'title' ), props.title )
        equal( wrapper.first().text(), props.text )
    } )

    it( 'should render "button" when "action" is not defined', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().type(), 'button' )
    } )

    it( 'should render "button" when "action" is a function', () => {
        props.action = () => void 0
        const wrapper = getWrapper()
        equal( wrapper.first().type(), 'button' )
    } )

    it( 'should not set onClick event if action is not a function or string', () => {
        props.action = undefined
        const wrapper = getWrapper()
        equal( wrapper.first().prop( 'onClick' ), undefined )
    } )

    it( 'should render "a" when "action" is a string', () => {
        props.action = 'test'
        const wrapper = getWrapper()
        equal( wrapper.first().type(), 'a' )
    } )
} )

describe( '<ButtonCheckable />', () => {
    let props: ButtonCheckableProps

    const getWrapper = () => {
        return shallow( <ButtonCheckable {...props} /> )
    }

    beforeEach( () => {
        // Setup props
        props = {
            text: 'test button',
            title: 'test title'
        }
    } )

    it( 'should render a checkbox inside a button', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().prop( 'text' ), props.text )
        equal( wrapper.first().find( '.checkbox' ).length, 1 )
    } )

    it( 'Checkbox should have class "hidden" if "checkState" is not true', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().find( '.checkbox' ).find( '.hidden' ).length, 1 )
        props.checkState = false
        const wrapper2 = getWrapper()
        equal( wrapper2.first().find( '.checkbox' ).find( '.hidden' ).length, 1 )
    } )


    it( 'Checkbox should not have class "hidden" if "checkState" is true', () => {
        props.checkState = true
        const wrapper = getWrapper()
        equal( wrapper.first().find( '.checkbox' ).find( '.hidden' ).length, 0 )
    } )
} )

describe( '<ButtonNavLink />', () => {
    let props: ButtonNavLinkProps

    const getWrapper = () => {
        return shallow( <ButtonNavLink {...props} /> )
    }

    beforeEach( () => {
        // Setup props
        props = {
            to: '/',
            text: 'test button',
            title: 'test title'
        }
    } )

    it( 'should render a "Link" element', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().name(), 'Link' )
    } )

    it( 'should render props "title" as title, "text" as child, "action" as onClick and "to" as to', () => {
        const wrapper = getWrapper()
        equal( wrapper.first().prop( 'title' ), props.title )
        equal( wrapper.first().children().text(), props.text )
        equal( wrapper.first().prop( 'onClick' ), props.action )
        equal( wrapper.first().prop( 'to' ), props.to )
    } )
} )
