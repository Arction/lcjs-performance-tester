import * as React from 'react'

/**
 * Props for a animatable container
 */
export interface AnimatableProps {
    /**
     * Base css class for the animation
     */
    baseClass: string,
    /**
     * The class that when added runs the animation
     */
    animationClass: string
}

/**
 * Component to run an animation.
 * Animation start is manual.
 */
export class Animatable extends React.PureComponent<AnimatableProps> {
    /**
     * Reference to the DIV that is used as the animation target.
     */
    private animationRef: React.RefObject<HTMLDivElement> = React.createRef()

    constructor( props: AnimatableProps ) {
        super( props )
        this.runAnim = this.runAnim.bind( this )
        this.stopAnim = this.stopAnim.bind( this )
    }

    /**
     * Run the animation
     */
    runAnim() {
        if ( this.animationRef.current ) {
            this.animationRef.current.classList.remove( this.props.animationClass )
            this.animationRef.current.classList.add( this.props.animationClass )
        }
    }

    /**
     * Stop the animation
     */
    stopAnim() {
        if ( this.animationRef.current ) {
            this.animationRef.current.classList.remove( this.props.animationClass )
        }
    }

    render() {
        return (
            <div
                ref={this.animationRef}
                className={this.props.baseClass}
            >{this.props.children}</div>
        )
    }
}
