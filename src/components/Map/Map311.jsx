import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper, } from "google-maps-react"
import ImageGallery from 'react-image-gallery'
import update from 'immutability-helper'
import axios from 'axios'

import { modal } from '../../utilities/modal.js'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'

export class Map311 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serverDomain: "https://502c177ca878.ngrok.io",
            coordinatesList: [{case_id: 0, lat: 39.0410436302915, lng: -94.5876739197085}],
            firstImageReturned: false,
            imageList: [],
            returnedPercent: 0,
            serverError: true,
            rawData: null,

        };
    }
    
    componentDidMount() {
        this.processData();
    }

    processData() {
        var self = this;

        axios.get(this.state.serverDomain + "/api/311/get/all")
        .then(function(response) {
            var jsonData = JSON.parse(response.data)
            self.setState({
                rawData: jsonData
            })

            jsonData.forEach(function(request) {
                console.log(request)
                self.setState({
                    coordinatesList: update(self.state.coordinatesList, {$push: [{
                        case_id: request.case_id,
                        lat: request.lat,
                        lng: request.lng
                    }]
                    }),
                })
            })
        })
        .catch(function(error) {
            console.log(error)
            modal.showInfo("Error while connecting with the server!", "danger", "top", "center");
            self.setState({
                serverError: true
            })
        })
    }

    onMarkerClick() {
        this.setState({
            imageList: [],
            dataLoading: true,
            returnedPercent: 0,
        })

        //Set firstImageReturned = true + imageList
    }

    render() {
        const coordinatesList = this.state.coordinatesList;
        const imageList = this.state.imageList;
        const firstImageReturned = this.state.firstImageReturned;
        const returnedPercent = this.state.returnedPercent;
        const serverError = this.state.serverError;

        var helpText = 'No predictions. Click "Predict" button on the map to start.'

        if (!this.props.google) {
            return <div>Loading...</div>;
        }
        
        return (
        <div>
            <div className="row">
                <div className="col-md-6 map-view-container">
                    <div className="map-container">
                        <Map
                            google={this.props.google} 
                            initialCenter={{lat: coordinatesList[0].lat, lng: coordinatesList[0].lng}}
                            center={{lat: coordinatesList[0].lat, lng: coordinatesList[0].lng}}
                            zoom={14}
                        >
                        
                        {coordinatesList.map((location) =>
                        <Marker
                            position={{lat: location.lat, lng: location.lng}}
                            name={"311 Location"}
                            icon={{
                                //TODO: Move image to local
                              url: "https://p7.hiclipart.com/preview/1020/199/663/computer-icons-clip-art-green-circle-icon.jpg",
                              anchor: new window.google.maps.Point(64, 64),
                              scaledSize: new window.google.maps.Size(15, 15)
                            }}
                            onClick={this.onMarkerClick.bind(this)}
                        />
                        )}

                        </Map>
                    </div>
                </div>
                <div className="col-md-5" align="center">
                    {imageList.length > 0 ? (
                    <div>
                        <ImageGallery
                            items={imageList}
                            showPlayButton={false}
                        />
                    </div>
                    ) : (
                    <div>
                        {firstImageReturned === false && (
                        <div>
                            {helpText}
                        </div>
                        )}
                    </div>
                    )}
                    {(firstImageReturned === true && serverError === false) && (
                        <div>
                            <br />
                            <ProgressBar bgcolor={"#00695c"} completed={returnedPercent} />
                        </div>
                    )}
                </div>
            </div>
            <div className="row">
                <div className="col-md-6" align="center">
                    GOOGLE STREET VIEW 3D HERE!
                </div>
            </div>
        </div>
        );
    }
}
export default GoogleApiWrapper({
apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
v: "3.30"
})(Map311);
