import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper, InfoWindow } from "google-maps-react"
import ImageGallery from 'react-image-gallery'
import update from 'immutability-helper'
import axios from 'axios'

import { modal } from '../../utilities/modal.js'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import { FilterTiltShiftSharp } from "@material-ui/icons"

export class Map311 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serverDomain: "https://51a14464797b.ngrok.io",
            processedData: [],
            firstImageReturned: false,
            imageList: [],
            returnedPercent: 0,
            serverError: true,
            rawData: null,
            infoWindowContent: (
                <div></div>
            ),
            showingInfoWindow: false,
            activeMarker: {},
        };
    }
    
    componentDidMount() {
        this.processData();
    }

    processData() {
        var self = this;

        axios.get(this.state.serverDomain + "/api/311/get/all")
        .then(function(response) {
            console.log(response.data)
            self.setState({
                processedData: response.data
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

    onMarkerClick(props, marker, e) {
        var self = this;
        const processData = this.state.processedData;

        processData.forEach(function(location) {
            if (location.case_id == props.caseId) {
                self.setState({
                    activeMarker: marker,
                    showingInfoWindow: true,
                    infoWindowContent: (
                    <div>
                        <h2>Address</h2>
                        <b>{location.address + ", Kansas City, MO " + location.zip_code}</b>
                    </div>
                    )
                });
            }
        })

        //Set firstImageReturned = true + imageList
    }

    onMapClicked(mapProps, map, clickEvent) { 
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null,
            })
        }
    };

    render() {
        const processedData = this.state.processedData;
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
            {processedData.length > 0 && (
            <div>
                <div className="row">
                    <div className="col-md-6 map-view-container">
                        <div className="map-container">
                            <Map
                                google={this.props.google} 
                                initialCenter={{lat: processedData[0].lat, lng: processedData[0].lng}}
                                center={{lat: processedData[0].lat, lng: processedData[0].lng}}
                                zoom={14}
                                onClick={this.onMapClicked.bind(this)}
                            >
                            
                            {processedData.map((location) =>
                            <Marker
                                position={{lat: location.lat, lng: location.lng}}
                                caseId={location.case_id}
                                icon={{
                                url: process.env.PUBLIC_URL + '/img/case_active_icon_2.png',
                                anchor: new window.google.maps.Point(64, 64),
                                scaledSize: new window.google.maps.Size(10, 10)
                                }}
                                onClick={this.onMarkerClick.bind(this)}
                            />
                            )}

                            <InfoWindow
                                marker={this.state.activeMarker}
                                visible={this.state.showingInfoWindow}
                            >
                                {this.state.infoWindowContent}
                            </InfoWindow>

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
            )}
        </div>
        );
    }
}
export default GoogleApiWrapper({
apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
v: "3.30"
})(Map311);
