import React, {useState} from 'react'
import SpeechRecognition, {useSpeechRecognition } from 'react-speech-recognition'
import moment from 'moment'
import Geocode from 'react-geocode'

import { modal } from '../../utilities/modal.js'

const Dictaphone = () => {
    Geocode.setApiKey("AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8")
    const { transcript, resetTranscript } = useSpeechRecognition();
    const [ currentTranscript, updateTranscript ] = useState('');
    var [ currentDate, setDate ] = useState("");
    var [ currentLocation, setLocation ] = useState("");

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        modal.showInfo("Your browser does not support speech recognition!", "danger", "top", "center");
        return null
    }

    const onStartListening = () => {
        if (currentTranscript !== '') {
            updateTranscript(currentTranscript + capitalizeFirstLetter(transcript)  + '. ')
            resetTranscript();
        }

        SpeechRecognition.startListening({
            continuous: true
        });

        modal.showInfo("Your voice is being detected!", "success", "top", "center");
    };

    const onStopListening = () => {
        SpeechRecognition.stopListening();
        setDate(moment().format('MMMM Do YYYY, h:mm:ss a'));
        if (currentLocation.length < 10){
            onSetLocation();
        }
        modal.showInfo("You have stopped the voice detection!", "success", "top", "center");
    }

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const onReset = () => {
        updateTranscript('')
        resetTranscript();
        modal.showInfo("Successfully reset!", "success", "top", "center");
    }

    const onChangeDescription = (e) => {
        resetTranscript();
        updateTranscript(e.target.value)
    }

    const onChangeCurrentLocation = (e) => {
        setLocation(e.target.value)
    }

    const getCurrentLocation = () => {
        if (navigator && navigator.geolocation) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(pos => {
                const coords = pos.coords;
                resolve({
                    lat: coords.latitude,
                    lng: coords.longitude
                });
                });
            });
        }
    }

    const onSetLocation = () => {
        var curLocation = getCurrentLocation();
        curLocation.then(function(result){
            if (result.lat != null && result.lng != null) {
                Geocode.fromLatLng(result.lat, result.lng).then(
                    response => {
                        const address = response.results[0].formatted_address
                        setLocation(address)
                    },
                    error => {
                        modal.showInfo("Could not determine your current location!", "danger", "top", "center");
                        setLocation("")
                    }
                )
            }
            else {
                modal.showInfo("Could not determine your current location!", "danger", "top", "center");
                setLocation("")
            }
        })
    }

    const onSubmitRequest = () => {
        // modal.showSuccessModalWithOK("Are you sure?", "Make sure the information is correct. Are you sure to submit the request?", "Submit")
        //TODO Setup API
        modal.showInfo("Request submitted successfully!", "success", "top", "center");
        Geocode.fromAddress(currentLocation).then(
            response => {
                console.log(response)
                const { lat, lng } = response.results[0].geometry.location;
                console.log(lat, lng);
                setLocation(response['results'][0]['formatted_address'])
            },
            error => {
                console.error(error);
            }
        );
    }

    return (
    <div className="col-md-12">
        <div class="header">
            <h4 class="title" style={{fontSize: "150%"}}>Submit a 311 Request</h4>
            <p class="category"></p>
        </div>
        <div class="content">
            <form>
                <div className="row">
                    <div className="col-md-12">
                        <div className="row">
                            <div class="col-md-6" align='center'>
                                <div class="form-group" align='left'>
                                    <label for="assignee">Description</label>
                                    <textarea rows="12" cols="80" class="form-control" placeholder='Press "Start Voice Recording" and say something!' value={currentTranscript + transcript} onChange={onChangeDescription}/>
                                </div>
                                <button type="button" className="btn btn-primary" onClick={onStartListening} autoComplete="off">Start Voice Recording</button>
                                <button type="button" className="btn btn-danger" onClick={onStopListening} autoComplete="off">Stop Voice Recording</button>
                                <button type="button" className="btn btn-secondary" onClick={onReset} autoComplete="off">Reset Text</button>
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label for="assignee">Current Date & Time</label>
                                    <input className="form-control" placeholder="Date of this request" value={currentDate}/>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label for="assignee">Current Location</label>
                                    <input className="form-control" placeholder="Your current location" value={currentLocation} onChange={onChangeCurrentLocation}/>
                                </div>
                            </div>
                        </div>
                        <div className = 'col-md-6' align='center'>
                            <button type="button" className="btn btn-primary" onClick={onSubmitRequest} autoComplete="off">Submit</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    )
}
export default Dictaphone