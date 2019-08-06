import * as chai from 'chai'
import 'mocha'

export const expect = chai.expect
export const check = ( result: any ) => expect( result ).to.be.true
export const exist = ( result: any ) => expect( result ).to.exist
export const equal = <T = any>( obj1: T, obj2: T ) => expect( obj1 ).to.eql( obj2 )
export const notEqual = <T = any>( obj1: T, obj2: T ) => expect( obj1 ).to.not.eql( obj2 )
export const greaterThan = <T = any>( obj1: T, obj2: number ) => expect( obj1 ).to.be.greaterThan( obj2 )
export const contains = <T = any>( obj1: T, obj2: T ) => expect( obj1 ).to.contain( obj2 )
