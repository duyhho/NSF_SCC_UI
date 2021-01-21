import React, { Component } from 'react'
import ChatBot from 'react-simple-chatbot'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import Geocode from 'react-geocode'
import moment from 'moment'
import {locationProvider} from '../../controllers/LocationProvider.js'
const chatbotTheme = {
    background: '#f5f8fb',
    headerBgColor: '#CD853F',
    headerFontColor: '#FFFFFF',
    headerFontSize: '25px',
    botBubbleColor: '#CD853F',
    botFontColor: '#FFFFFF',
    userBubbleColor: '#28a745',
    userFontColor: '#FFFFFF',
};
class RequestForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            request_location: '',
            request_description: '',
            formattedNewLocation: '',
        };
    }

    componentWillMount() {
        var self = this;
        const { steps } = this.props;
        const { request_location, request_description, update_request_location_user_input } = steps;

        if (update_request_location_user_input !== undefined) {
            Geocode.fromAddress(update_request_location_user_input.value).then(
                response => {
                    self.setState({
                        currentLocation: response['results'][0]['formatted_address']
                    })
                },
                error => {
                    self.setState({
                        formattedNewLocation: update_request_location_user_input.value
                    })
                }
            );
        }
        locationProvider.setCurrentLocation(function(response){
            self.setState({
                currentLocation: response,
                request_location: request_location,
                request_description: request_description,
            });
        });

    }

    render() {
        const { request_location, request_description, formattedNewLocation } = this.state;
        // var currentLocation = this.state.currentLocation
        // console.log(formattedNewLocation)
        // if (formattedNewLocation !== undefined) {
        //     currentLocation = formattedNewLocation
        // } else if (request_location.value !== undefined) {
        //     currentLocation = request_location.value
        // }

        return (
            <div style={{width: "100%"}}>
                <h3>311 Request</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>Location: </td>
                            <td>{this.state.currentLocation}</td>
                        </tr>
                        <tr>
                            <td>Time: </td>
                            <td>{moment().format('MMMM Do YYYY, h:mm:ss a')}</td>
                        </tr>
                        <tr>
                            <td>Description: </td>
                            <td>{request_description.value}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

class FormattedNewLocation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            request_location: '',
            formattedNewLocation: '',
        };
    }

    componentWillMount() {
        var self = this;
        const { steps } = this.props;
        const { request_location, update_request_location_user_input } = steps;

        if (update_request_location_user_input !== undefined) {
            Geocode.fromAddress(update_request_location_user_input.value).then(
                response => {
                    self.setState({
                        formattedNewLocation: response['results'][0]['formatted_address']
                    })
                },
                error => {
                    self.setState({
                        formattedNewLocation: update_request_location_user_input.value
                    })
                }
            );
        }

        this.setState({
            request_location: request_location,
        });
    }

    render() {
        const { request_location, formattedNewLocation } = this.state;
        var currentLocation = ""
        if (formattedNewLocation !== undefined) {
            currentLocation = formattedNewLocation
        } else if (request_location.value !== undefined) {
            currentLocation = request_location.value
        }

        return (
            <div style={{width: "100%"}}>Your new address is {currentLocation}. Is this correct?</div>
        );
    }
}

RequestForm.propTypes = {
    steps: PropTypes.object,
};

RequestForm.defaultProps = {
    steps: undefined,
};

export default class Chatbot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStepId: 0,
            steps: [
                {
                    id: "start_chat",
                    message: "Hello! How can I help you today?",
                    trigger: "start_options"
                },
                {
                    id: "start_options",
                    options: [
                        { value: "Submit", label: "Submit a 311 Request", trigger: "start_request" },
                        { value: "Quit", label: "Nothing", trigger: "end_chat" },
                    ],
                },
                {
                    id: "start_request",
                    message: "Can I get the description of the request?",
                    trigger: "request_description"
                },
                {
                    id: "request_description",
                    user: true,
                    validator: (value) => {
                        if (value === "") {
                            return "You must enter something!";
                        }
                        return true;
                    },
                    trigger: "request_location"
                },
                {
                    id: "request_location",
                    message: "Your current location is: " + locationProvider.getCurrentLocation() + ". Is this correct?",
                    trigger: "confirm_location"
                },
                {
                    id: "confirm_location",
                    options: [
                        { value: "Yes", label: "Yes", trigger: "confirm_submission_message" },
                        { value: "No", label: "No", trigger: "edit_location" },
                    ],
                },
                {
                    id: "edit_location",
                    message: "Type in your current address!",
                    trigger: "update_request_location_user_input"
                },
                {
                    id: "update_request_location_user_input",
                    user: true,
                    validator: (value) => {
                        if (value === "") {
                            return "You must enter something!";
                        }
                        return true;
                    },
                    trigger: "confirm_new_location"
                },
                {
                    id: "confirm_new_location",
                    component: <FormattedNewLocation />,
                    asMessage: true,
                    trigger: "confirm_location"
                },
                {
                    id: "confirm_submission_message",
                    message: "Below is the overview of the request. Is this correct?",
                    trigger: "submission_form"
                },
                {
                    id: "submission_form",
                    component: <RequestForm />,
                    asMessage: true,
                    trigger: "confirm_submission"
                },
                {
                    id: "confirm_submission",
                    options: [
                        { value: "Yes", label: "Yes", trigger: "submit_form" },
                        { value: "No", label: "No", trigger: "reject_submission" },
                    ],
                },
                {
                    id: "reject_submission",
                    message: "What would you like to do next?",
                    trigger: "edit_submission"
                },
                {
                    id: "edit_submission",
                    options: [
                        { value: "Edit Location", label: "Edit Location", trigger: "edit_location" },
                        { value: "Edit Description", label: "Edit Description", trigger: "update_description" },
                        { value: "End", label: "Nah, let's Submit!", trigger: "submit_form" },
                    ],
                },
                {
                    id: "update_description",
                    update: "request_description",
                    trigger: "confirm_submission_message"
                },
                {
                    id: "submit_form",
                    message: "Thank you. Your request has been submitted!",
                    trigger: "end_chat"
                },
                {
                    id: "end_chat",
                    message: "Thank you for talking with me today!",
                    end: true,
                },
            ]
        };
    }

    componentDidMount() {

    }

    submitForm({steps, values}) {
        console.log(steps)
        console.log(values)
    }
    componentWillMount(){
        var self = this
        setTimeout(() => {
            self.setState({
                voice: window.speechSynthesis.getVoices()[0]
            })
        }, 50);
    }
    render() {
        const voice = this.state.voice
        console.log(voice)
        return (
            <div className="page-container">
                <div className="col-md-6 offset-md-3">
                    <ThemeProvider theme={chatbotTheme}>
                        <ChatBot
                            handleEnd={this.submitForm.bind(this)}
                            headerTitle="Chatbot"
                            speechSynthesis={{ enable: true, lang: 'en'}}
                            steps={this.state.steps}
                            placeholder="Enter a message"
                            recognitionEnable={true}
                            width="100%"
                            userDelay={0}
                        />
                    </ThemeProvider>
                </div>
            </div>
        )
    }
}