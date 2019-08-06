const expect = require('chai').expect
/**
 * Check if the function returns null with null or undefined input
 * @param {Function} func Function to test, allows 1 parameter
 */
const returnsNullWithNullOrUndefined = (func) => {
    returnsExpectedValueWithNullOrUndefined(func, null)
}

/**
 * Check if the function returns expected value with null or undefined input
 * @param {Function} func Function to test, allows 1 parameter
 */
const returnsExpectedValueWithNullOrUndefined = (func, x) => {
    const input = null
    const input2 = undefined
    expect(func(input)).to.equal(x)
    expect(func(input2)).to.equal(x)
}

/**
 * Check if the function returns null with non string input
 * @param {Function} func Function to test, allows 1 parameter
 */
const returnsNullWithNonStringInput = (func) => {
    returnsExpectedValueWithNonStringInput(func, null)
}

/**
 * Check if the function returns expected value with non string input
 * @param {Function} func Function to test, allows 1 parameter
 */
const returnsExpectedValueWithNonStringInput = (func, x) => {
    const input = 1
    const input2 = { arction: true }
    expect(func(input)).to.equal(x)
    expect(func(input2)).to.equal(x)
}

module.exports = {
    returnsExpectedValueWithNonStringInput,
    returnsExpectedValueWithNullOrUndefined,
    returnsNullWithNonStringInput,
    returnsNullWithNullOrUndefined
}
