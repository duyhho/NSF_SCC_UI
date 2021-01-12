import React, { Component } from "react"

export default class Visualization311 extends Component {
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
                <iframe title="KC311 311 Visualization" src="http://kc311.herokuapp.com" style={{width: "100%", height: "100%"}}></iframe>
            </div>
        )
    }
}