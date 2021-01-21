import React, { Component } from "react"
import Dictaphone from './dictaphoneSetup.js'

export default class Send311Request extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    componentDidMount() {

    }

    render() {
        return (
            <div className="page-container">
                <div className="row request-form">
                    <Dictaphone />
                </div>
            </div>
        )
    }
}