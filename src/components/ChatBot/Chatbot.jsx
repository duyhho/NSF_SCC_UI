import React, { Component } from 'react'
import ChatBot from 'react-simple-chatbot'
import { ThemeProvider } from 'styled-components'

const chatbotTheme = {
    background: '#f5f8fb',
    headerBgColor: 'peru',
    headerFontColor: '#FFFFFF',
    headerFontSize: '25px',
    botBubbleColor: 'peru',
    botFontColor: '#FFFFFF',
    userBubbleColor: 'green',
    userFontColor: '#FFFFFF',
};

export default class Chatbot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: [
                {
                    id: '0',
                    message: 'Welcome to react chatbot!',
                    trigger: '1',
                },
                {
                    id: '1',
                    user: true
                },
            ]
        };
    }
    componentDidMount() {

    }

    render() {
        return (
            <div className="page-container">
                <ThemeProvider theme={chatbotTheme}>
                    <ChatBot steps={this.state.steps} />
                </ThemeProvider>
            </div>
        )
    }
}