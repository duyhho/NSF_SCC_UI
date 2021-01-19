import React from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { modal } from '../../utilities/modal.js'

const Dictaphone = () => {
  const { transcript, resetTranscript } = useSpeechRecognition()

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    modal.showInfo("Your browser does not support speech recognition!", "danger", "top", "center");
    return null
  }

  const onStartListening = () => {
    SpeechRecognition.startListening({
      continuous: true
    });
    modal.showInfo("Your voice is being detected!", "success", "top", "center");
  };

  const onStopListening = () => {
    SpeechRecognition.stopListening();
    modal.showInfo("You have stopped the voice detection!", "success", "top", "center");
  }

  const onReset = () => {
    resetTranscript();
    modal.showInfo("Successfully reset!", "success", "top", "center");
  }

  return (
    <div className="row col-md-12">
      <div className="col-md-6 offset-md-3">
        <input type="text" className="form-control" value={transcript} placeholder="Press Start and say something!"></input>
      </div>
      <div className="col-md-6 offset-md-5">
        <button className="btn btn-primary" onClick={onStartListening}>Start</button>
        <button className="btn btn-danger" onClick={onStopListening}>Stop</button>
        <button className="btn btn-secondary" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}
export default Dictaphone