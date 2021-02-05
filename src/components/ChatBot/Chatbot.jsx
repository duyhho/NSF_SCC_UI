
// https://dl.dropboxusercontent.com/s/yjd2lxrwvmkc12q/Council%20Districts.geojson?dl=0
// https://dl.dropboxusercontent.com/s/67xw4zvp2retyah/School%20Districts.geojson?dl=0
// https://dl.dropboxusercontent.com/s/nnvcad4r0twpij1/Police%20Divisions.geojson?dl=0

import React, { Component } from 'react'
import ChatBot from 'react-simple-chatbot'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import Geocode from 'react-geocode'
import moment from 'moment'
import DropzoneComponent from 'react-dropzone-component'

import { dropZone } from '../../utilities/DropZoneHandler.js'
import { modal } from '../../utilities/modal.js'
import { locationProvider } from '../../controllers/LocationProvider.js'
import { dummyData } from './dummyData.js'
import axios from 'axios'

import "firebase/firestore";
import {
  FirebaseAppProvider,
} from "reactfire";
import {CaseData, SyncSubmission} from './firebaseData.js'
// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAuqrJSVK3_RyZkIPGt2nqt2XMM9XvLad8",
    authDomain: "nsfscc-umkc.firebaseapp.com",
    projectId: "nsfscc-umkc",
    storageBucket: "nsfscc-umkc.appspot.com",
    messagingSenderId: "1051748532808",
    appId: "1:1051748532808:web:329f4b10628ab679a38e7d",
    measurementId: "G-3NK4G5XJZM"
  };
var submissionDetails = {
    case_id: '2021' + Math.floor(100000 + Math.random() * 900000),
    source: 'CHATBOT',
    department: '',
    workgroup: '',
    request_type: '',
    category: '',
    type: '',
    detail: '',
    creation_date: '',
    creation_time: '',
    creation_month: '',
    creation_year: '',
    status: 'OPEN',
    exceeded: 'N',
    closed_date: '',
    closed_month: '',
    closed_year: '',
    days_to_close: '',
    location: '',
    address_with_geocode:'',
    zipcode: '',
    nbh_name: '',
    county: '',
    council: '',
    police_department: '',
    parcel_id: '',
    latLng: {},
    description: '',
    time: '',
    blockgroup_id: '',
    nbh_id: '',
    council_district: '',
    police_district: ''
};
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


class CurrentLocation extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount() {
        var self = this;
        const { steps } = this.props;
        const { update_request_location_user_input } = steps;

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
        } else {
            locationProvider.getCurrentLocation(function(response) {
                self.setState({
                    formattedNewLocation: response
                })
            })
        }
    }

    render() {
        const { formattedNewLocation } = this.state;

        return (
            <div style={{width: "100%"}}>Your current address is {formattedNewLocation}. Is this correct?</div>
        );
    }
}
class RequestForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // request_description: null
        };
    }

    componentWillMount() {
        var self = this;
        const { steps } = this.props;
        // console.log(this.props)
        console.log(steps)
        const { request_description, update_request_location_user_input } = steps;
        console.log(request_description)
        if (update_request_location_user_input !== undefined) {
            Geocode.fromAddress(update_request_location_user_input.value).then(
                response => {
                    console.log(response['results'])
                    response.results[0].address_components.forEach(comp => {
                        if (comp.types[0] === 'postal_code'){
                            submissionDetails.zipcode = comp.long_name
                        }
                        else if (comp.types[0] === 'administrative_area_level_2'){
                            submissionDetails.county = comp.long_name
                        }

                    })
                    self.setState({
                        formattedNewLocation: response['results'][0]['formatted_address']

                    })
                    submissionDetails.location = response['results'][0]['formatted_address']
                    submissionDetails.latLng = {lat: response['results'][0]['geometry']['location'].lat.toFixed(6),
                                                lng: response['results'][0]['geometry']['location'].lng.toFixed(6),
                                                }
                },
                error => {
                    self.setState({
                        formattedNewLocation: update_request_location_user_input.value
                    })
                }
            );
        } else {
            locationProvider.getCurrentLocation(function(response) {
                self.setState({
                    formattedNewLocation: response
                })
                submissionDetails.location = response
                submissionDetails.latLng = locationProvider.getLatLng()
                submissionDetails.zipcode = locationProvider.getZipcode()
                submissionDetails.county = locationProvider.getCounty()

            })
        }
        const request_time = moment().format('MMMM Do YYYY, h:mm:ss a')
        const request_date = moment().format('MM/DD/YYYY')
        const request_month = moment().format('MM')
        const request_hour = moment().format('h:mm A')
        const request_year = moment().format('YYYY')



        this.setState({
            request_description: request_description,
            request_time: request_time
        })
        submissionDetails.description = request_description.value
        submissionDetails.time = request_time
        submissionDetails.creation_date = request_date
        submissionDetails.creation_month = request_month
        submissionDetails.creation_time = request_hour
        submissionDetails.creation_year = request_year




    }

    render() {
        const { request_description, formattedNewLocation, request_time } = this.state;
        console.log(request_description)
        return (
            <div style={{width: "100%"}}>
                <h3>311 Request</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>Location: </td>
                            <td>{formattedNewLocation}</td>
                        </tr>
                        <tr>
                            <td>Time: </td>
                            <td>{request_time}</td>
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
            dummyData: [],
            cols: [],
            submitted: false,

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
                    component: <CurrentLocation />,
                    asMessage: true,
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
                    message: "Please type in your current address!",
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
                    trigger: "request_location"
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
                        { value: "Edit Description", label: "Edit Description", trigger: "edit_description_message" },
                        { value: "End", label: "Submit!", trigger: "submit_form" },
                    ],
                },
                {
                    id: "edit_description_message",
                    message: "Please revise your description below.",
                    trigger: "request_description"
                },
                {
                    id: "update_description",
                    update: "request_description",
                    trigger: "confirm_submission_message"
                },
                {
                    id: "submit_form",
                    message: "Thank you. Your request has been submitted! Please see your case below.",
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
        this.setState({
            voice: window.speechSynthesis.getVoices()[4]
        })
        dropZone.setup(this, '311Request', 0); //TODO: Update "0" to be the ID of the request
        var self = this
        dummyData.getData(function(response){
            // console.log(response)
            self.setState({
                cols: Object.keys(response[0]),
                dummyData: response
            })
        })

    }

    submitForm({steps, values}) {
        // console.log(steps)
        // console.log(values)
        var self = this
        axios.get(`https://nsfscc-bert.ngrok.io/getPrediction?description=${submissionDetails.description}`)
            .then(function(response) {
            submissionDetails.category = response.data['Category']
            submissionDetails.department = response.data['Department']
            axios.get(`https://nsfscc-bert.ngrok.io/getGeoLocations?latitude=${submissionDetails.latLng.lat}&longitude=${submissionDetails.latLng.lng}`)
                .then(function(response) {
                    submissionDetails.nbh_id = response.data['nbhid']
                    submissionDetails.nbh_name = response.data['nbhname']
                    submissionDetails.blockgroup_id = response.data['block_id']
                    submissionDetails.council_district = response.data['district']
                    submissionDetails.police_district = response.data['divisionname']

                    console.log(submissionDetails)
                    console.log(self.state.dummyData)
                    const newRow = {
                        "CASE ID": submissionDetails.case_id,
                        "SOURCE": "CHATBOT",
                        "DEPARTMENT": submissionDetails.department,
                        "WORK GROUP": "",
                        "REQUEST TYPE": "",
                        "CATEGORY": submissionDetails.category,
                        "TYPE": "",
                        "DETAIL": "",
                        "CREATION DATE": submissionDetails.creation_date,
                        "CREATION TIME": submissionDetails.creation_time,
                        "CREATION MONTH": submissionDetails.creation_month,
                        "CREATION YEAR": submissionDetails.creation_year,
                        "STATUS": "OPEN",
                        "EXCEEDED EST TIMEFRAME": "N",
                        "CLOSED DATE": "",
                        "CLOSED MONTH": "",
                        "CLOSED YEAR": "",
                        "DAYS TO CLOSE": "",
                        "STREET ADDRESS": submissionDetails.location,
                        "ADDRESS WITH GEOCODE": submissionDetails.location + ` (${submissionDetails.latLng.lat}, ${submissionDetails.latLng.lng} )`,
                        "ZIP CODE": submissionDetails.zipcode,
                        "NEIGHBORHOOD": submissionDetails.nbh_name,
                        "COUNTY": submissionDetails.county,
                        "COUNCIL DISTRICT": submissionDetails.council_district,
                        "POLICE DISTRICT": submissionDetails.police_district,
                        "PARCEL ID NO": "",
                        "LATITUDE": submissionDetails.latLng.lat,
                        "LONGITUDE": submissionDetails.latLng.lng,
                        "CASE URL": submissionDetails.description,
                        "30-60-90 Days Open Window": "",
                        "nbh_id": submissionDetails.nbh_id,
                        "nbh_name": submissionDetails.nbh_name,
                        "BLOCKGROUP ID": submissionDetails.blockgroup_id
                    }
                    var updatedData = [newRow]
                    const dummyData = self.state.dummyData
                    dummyData.forEach(data => {
                        updatedData.push(data)
                    })
                    self.setState({
                        submitted: true,
                        dummyData: updatedData
                    })
                })
                .catch(function(e) {
                    console.log(e)
                })
            })


            .catch(function(e) {
                console.log(e)
            })

    }

    triggerUpload() {
        dropZone.upload(function() {
            if (dropZone.isUploadSuccess() === true) {
                modal.showInfo("You have uploaded the files successfully!", "success", "top", "center");
            } else if (dropZone.isFilesAdded() === false) {
                modal.showInfo("There is no pending file to upload!", "warning", "top", "center");
            }
        });
    }

    render() {
        const submitted = this.state.submitted
        console.log(window.speechSynthesis.getVoices())
        return (
            <FirebaseAppProvider firebaseConfig={firebaseConfig}>
                <div className="page-container overflow">
                    <div className="row">
                        <div className="col-md-6">
                            <ThemeProvider theme={chatbotTheme}>
                                <ChatBot
                                    handleEnd={this.submitForm.bind(this)}
                                    headerTitle="Chatbot"
                                    speechSynthesis={{ enable: true, lang: 'en', voice: this.state.voice }}
                                    steps={this.state.steps}
                                    placeholder="Enter a message"
                                    recognitionEnable={true}
                                    width="100%"
                                    userDelay={0}
                                />
                            </ThemeProvider>
                        </div>
                        <div className="col-md-5">
                            {this.state.dropZoneSetup !== undefined && (
                            <div align="center">
                                <DropzoneComponent
                                    config={this.state.dropZoneConfig}
                                    eventHandlers={this.state.dropZoneEventHandlers}
                                    djsConfig={this.state.dropZoneJSConfig}
                                />
                                <button type="button" className="btn btn-primary" onClick={this.triggerUpload.bind(this)} autoComplete="off">Upload</button>
                            </div>
                            )}
                        </div>
                    </div>
                    {submitted === true && <SyncSubmission submissionDetails = {submissionDetails}/>}
                    <hr></hr>
                    <h1 style = {{textAlign: 'center'}}>311 Case Records</h1>
                    <CaseData status = "hello" />

                    {/* <div className = 'row data-table'>
                        <div className="col-md-6">
                            <table class="ui sortable celled table " >
                                <thead>
                                    <tr>
                                        {cols.map(col => {
                                            // console.log(<th>{col}</th>)
                                            return  <th>{col}</th>
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        dummyData.map(row => {
                                            // console.log(row['CASE ID'].toString())
                                            if (row['CASE ID'].toString().includes('2021')){
                                                    return <tr>
                                                        {Object.values(row).map(val => {
                                                            return <td class='positive'>{val}</td>
                                                        })}
                                                    </tr>
                                                }
                                            return  <tr>
                                                {Object.values(row).map(val => {
                                                    return <td>{val}</td>
                                                })}
                                            </tr>
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </div>
            </FirebaseAppProvider>

        )
    }
}