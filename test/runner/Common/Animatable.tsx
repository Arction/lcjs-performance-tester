import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { Animatable, AnimatableProps } from '../../../src/Common/Animatable'
import { check, expect, equal, exist, greaterThan } from '../../tools'
import { testItem1, testItem2, getTestItemsMap } from '../../testItems'
import Item from '../../../src/Item'
import { OrderedMap } from 'immutable'
import { spy, SinonSpy } from 'sinon'

describe( '<Animatable />', () => {
    let props: AnimatableProps & { children?: any }

    const getWrapper = () => {
        return shallow( <Animatable {...props} /> )
    }
    const getMount = () => {
        return mount( <Animatable {...props} /> )
    }

    beforeEach( () => {
        // Setup props
        props = {
            baseClass: 'animation',
            animationClass: 'animation-run'
        }
    } )

    it( 'should render the child inside a div with the "baseClass"', () => {
        props.children = 'test'
        const wrapper = getWrapper()
        equal( wrapper.first().type(), 'div' )
        check( wrapper.first().hasClass( props.baseClass ) )
        equal( wrapper.first().children().text(), props.children )
    } )

    describe( 'with spies', () => {
        let createRefSpy: SinonSpy

        beforeEach( () => {
            createRefSpy = spy( React, 'createRef' )
        } )
        afterEach( () => {
            createRefSpy.restore()
        } )

        it( 'should add "animationClass" when "runAnim" is called', () => {
            const wrapper = getMount()

            const animRef = createRefSpy.returnValues[0]
            animRef.current = {
                classList: {
                    remove: spy(),
                    add: spy()
                }
            }

            const inst = wrapper.instance() as Animatable
            inst.runAnim()

            check( animRef.current.classList.remove.calledOnce )
            check( animRef.current.classList.add.calledOnce )
            check( animRef.current.classList.add.calledWith( props.animationClass ) )
        } )

        it( 'should remove "animationClass" when "stopAnim" is called', () => {
            const wrapper = getMount()

            const animRef = createRefSpy.returnValues[0]
            animRef.current = {
                classList: {
                    remove: spy()
                }
            }

            const inst = wrapper.instance() as Animatable
            inst.stopAnim()

            check( animRef.current.classList.remove.calledOnce )
            check( animRef.current.classList.remove.calledWith( props.animationClass ) )
        } )
    } )
} )

