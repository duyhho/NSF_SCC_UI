import React, {useState, useEffect} from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { modal } from '../../utilities/modal.js'

const Dictaphone = () => {
    const { transcript, resetTranscript } = useSpeechRecognition();
    const [currentTranscript, updateTranscript] = useState('')

    const [speaking, updateSpeaking] = useState(false)
    useEffect(() => {
        if (!speaking){
            
        }
    })
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        modal.showInfo("Your browser does not support speech recognition!", "danger", "top", "center");
        return null
    }
    var currentDate = "";
    var currentLocation = "";

    const onStartListening = () => {
        console.log('onStartListening()')
        if(currentTranscript != '') {
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
        modal.showInfo("You have stopped the voice detection!", "success", "top", "center");
    }
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      
    const onReset = () => {
        updateTranscript('')
        resetTranscript();

        console.log(currentTranscript)
        modal.showInfo("Successfully reset!", "success", "top", "center");
    }

    const onChangeDescription = (e) => {
        console.log(e.target.value)
        resetTranscript();

        console.log(transcript)
        updateTranscript(e.target.value)

        // currentTranscript += e.target.value
        // console.log(currentTranscript)
    }

    return (
        <div className="col-md-12">
        <div class="header">
            <h4 class="title">Submit a 311 Request</h4>
            <p class="category"></p>
        </div>
        <div class="content">
            <form>
            <div className="row">
                <div className="col-md-12">
                <div className="row">
                    <div class="col-md-6">
                    <div class="form-group">
                        <label for="assignee">Description</label>
                        <textarea rows="4" cols="80" class="form-control" placeholder="Press Start and say something!" value={currentTranscript + transcript} onChange={onChangeDescription}/>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={onStartListening} autoComplete="off">Start Voice Recording</button>
                    <button type="button" className="btn btn-danger" onClick={onStopListening} autoComplete="off">Stop Voice Recording</button>
                    <button type="button" className="btn btn-secondary" onClick={onReset} autoComplete="off">Reset Text</button>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col-md-3">
                    <div class="form-group">
                        <label for="assignee">Current Date</label>
                        <input class="form-control" placeholder="Date of this request" value={currentDate}/>
                    </div>
                    </div>
                    <div className="col-md-3">
                    <div class="form-group">
                        <label for="assignee">Current Location</label>
                        <input class="form-control" placeholder="Your current location" value={currentLocation}/>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </form>
        </div>
    </div>
    )
}
export default Dictaphone