import * as React from 'react'
import { Link } from 'react-router-dom'

/**
 * A function that takes MouseEvent as argument and returns void
 */
export type ActionFunction<T> = ( e: React.MouseEvent<T> ) => void

/**
 * Returns the class names for a button. Includes the class names from "className" prop and common classes for Button
 * @param props Component props
 */
const getButtonClasses = ( props: any ) => `${props && props.className ? props.className : ''} button`

/**
 * Props for a button
 */
export interface ButtonProps<T> {
    /**
     * CSS classes to append
     */
    className?: string,
    /**
     * Text shown on the button
     */
    text: string,
    /**
     * Title for the button, shows as tooltip
     */
    title: string,
    /**
     * Either URL to navigate to or a function to call
     */
    action?: string | ActionFunction<T>
}

/**
 * A generic button that either calls a function or navigates to a url when clicked
 * @param props Props for the button
 */
export const Button: React.SFC<ButtonProps<HTMLButtonElement>> = ( props ) => {
    const classes = getButtonClasses( props )
    return (
        ( typeof props.action === 'string' ) ?
            <a
                className={classes}
                href={props.action}
                target='_blank'
                rel='noopener'
                title={props.title}
            >{props.children}{props.text}</a>
            :
            <button className={classes}
                onClick={props.action ? props.action : undefined}
                title={props.title}
            >{props.children}{props.text}</button>
    )
}

/**
 * Props for checkable button
 */
export interface ButtonCheckableProps extends ButtonProps<HTMLButtonElement> {
    /**
     * Current check state, not managed by the button
     */
    checkState?: boolean
    /**
     * Class name to add for checked mark (when selected).
     */
    checkBoxClassName?: string
}

/**
 * A button that has a checkbox indicating checkstate
 * @param props Props for checkable button
 */
export const ButtonCheckable: React.SFC<ButtonCheckableProps> = ( props ) => (
    <Button {...props}>
        <div className='checkbox'>
            <div
                className={( props.checkState ?
                    ( 'unselectable' + props.checkBoxClassName ? ' ' + props.checkBoxClassName : '' ) :
                    'hidden'
                )}
            >
                X
            </div>
        </div>
    </Button>
)

/**
 * Props for nav link
 */
export interface ButtonNavLinkProps extends ButtonProps<HTMLAnchorElement> {
    /**
     * The target location
     */
    to: string
}

/**
 * A button for navigating inside the site
 * @param props Props for internal nav link
 */
export const ButtonNavLink: React.SFC<ButtonNavLinkProps> = ( props ) => (
    <Link
        className={getButtonClasses( props )}
        title={props.title}
        onClick={typeof props.action !== 'string' ? props.action : undefined}
        to={props.to}
    >{props.children}{props.text}</Link>
)

// Button implementation with two parts that form 'text'.
/**
 * Props for checkable button
 */
export interface ButtonSelectable extends ButtonProps<HTMLButtonElement> {
    /**
     * Additional string shown after 'text' property.
     */
    value: string
    /**
     * Class name for element which displays 'value'.
     */
    valueClassName?: string
}
/**
 * TODO: Comments
 */
export const ButtonSelector: React.SFC<ButtonSelectable> = ( props ) => {
    const classes = getButtonClasses( props )
    return (
        ( typeof props.action === 'string' ) ?
            <a
                className={classes}
                href={props.action}
                target='_blank'
                rel='noopener'
                title={props.title}
            >{props.children}{props.text}{props.value}</a>
            :
            <button className={classes}
                onClick={props.action ? props.action : undefined}
                title={props.title}
            >{props.children}{props.text}{<span className={props.valueClassName}>{props.value}</span>}</button>
    )
}
