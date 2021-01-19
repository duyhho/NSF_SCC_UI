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
                <iframe title="KC311 311 Visualization" src="https://kc311-env.eba-muums2p6.us-east-1.elasticbeanstalk.com/" style={{width: "100%", height: "100%"}}></iframe>
            </div>
        )
    }
}