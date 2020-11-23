import axios from "axios";

import React, { Component } from "react";
import MapContainer from "./components/Map/MapContainer";

class File extends Component {
  state = {
    // Initially, no file is selected
    selectedFile: null,
    returnedImage: null,
    currentImage: null,
  };

  // On file select (from the pop up)
  onFileChange = (event) => {
    // Update the state
    const reader = new FileReader();
    const currentImage = reader.readAsDataURL(event.target.files[0]);
    this.setState({ selectedFile: event.target.files[0] });
    reader.onloadend = function (e) {
      this.setState({
        currentImage: [reader.result],
      });
    }.bind(this);
    // this.setState({ currentImage: [reader.result] });
    // console.log("shiba", this.currentImage);
  };

  // On file upload (click the upload button)
  onFileUpload = () => {
    var self = this; // this line is IMPORTANT as you specified which scope you need to focus on
    // Create an object of formData
    const formData = new FormData();

    // Update the formData object
    formData.append(
      "file",
      this.state.selectedFile,
      this.state.selectedFile.name
    );

    // Details of the uploaded file
    // console.log(this.state.selectedFile);
    console.log(formData.get("file"));
    // Request made to the backend api
    // Send formData object
    axios
      .post("http://cab1068f55da.ngrok.io/api/predict/utility", formData)
      .then(function (response) {
        console.log(response);

        // Remember to set state Shiva: here it has self.setState instead of this.setState because it will be confused with axios's scope
        self.setState({
          returnedImage: response.data,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // File content to be displayed after
  // file upload is complete
  fileData = () => {
    if (this.state.selectedFile) {
      return (
        <div>
          <h2>File Details:</h2>
          <p>File Name: {this.state.selectedFile.name}</p>
          <p>File Type: {this.state.selectedFile.type}</p>
          <p>
            Last Modified:{" "}
            {this.state.selectedFile.lastModifiedDate.toDateString()}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose an Image to predict</h4>
        </div>
      );
    }
  };

  render() {
    //best practice: create a local variable first to refer to global variables and functions
    const fileData = this.fileData();
    const returnedImage = this.state.returnedImage;

    return (
      <div align="center" className="bg-light" style={{ height: "900px" }}>
        <h1>Community Engagement</h1>
        <h3>File Upload for prediction</h3>
        <div className="row">
          <div className="col-md-6">
            {this.state.currentImage ? (
              <div>
                <h3>Image Uploaded</h3>{" "}
                <img
                  src={this.state.currentImage}
                  className="img-fluid"
                  width="320"
                  height="320"
                ></img>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="col-md-6">
            {returnedImage ? (
              <div>
                <h3>Predictions in Uploaded Image</h3>
                <img
                  src={"data:image/jpg;base64," + returnedImage}
                  className="img-fluid"
                  alt="Predicted Image"
                  width="320"
                  height="320"
                />
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="col-md-12">
            <input
              type="file"
              // className="form-control-file"
              onChange={this.onFileChange}
            />

            <button onClick={this.onFileUpload} className="btn btn-secondary">
              Predict
            </button>
          </div>
        </div>
        {fileData}
        {/* <MapContainer></MapContainer> */}
      
      </div>
    );
  }
}

export default File;
