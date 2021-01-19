import React, { Component } from "react"
import Dictaphone from './dictaphoneSetup.js'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export default class Chatbot extends Component {
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