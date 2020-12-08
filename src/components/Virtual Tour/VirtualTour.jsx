import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper } from "google-maps-react"
import ImageGallery from 'react-image-gallery'
import update from 'immutability-helper'

import { modal } from '../../utilities/modal.js'
import { server } from '../../controllers/Server.js'

import ProgressBar from '../ProgressBar/ProgressBar.jsx'

export class VirtualTour extends Component {
    constructor(props) {
        super(props);
        this.pano= React.createRef();

        this.state = {
            serverDomain: server.getServerDomain(),
            category: "utility",
            firstImageReturned: false,
            imageList: [],
            returnedPercent: 0,
            dataLoading: false,
            serverError: true,
            currentPanoId: 0,
            currentPosition: {lat: 39.0410436302915, lng: -94.5876739197085},
            currentHeading: 34,
            currentPitch: 10,
            imageHasObjects: true,
            panorama: null,
        };
    }
    
    componentDidMount() {
        var self = this;
        var curLocation = this.getcurrentLocation();
        
        curLocation.then(function(result){
            const location = {lat: result.lat, lng: result.lng}
            if (result.lat != null && result.lng != null) {
                self.setState({
                    currentPosition: location,
                    panorama: new window.google.maps.StreetViewPanorama(
                        self.pano.current,
                        {
                            position: location,
                            pov: {
                                heading: 50,
                                pitch: 16,
                            },
                            addressControl: false,
                            visible: true
                        }
                    )
                })
            } else {
                self.setState({
                    panorama: new window.google.maps.StreetViewPanorama(
                        self.pano.current,
                        {
                            position: {lat: 39.0410436302915, lng: -94.5876739197085},
                            pov: {
                                heading: 50,
                                pitch: 16,
                            },
                            addressControl: false,
                            visible: true
                        }
                    )
                })
            }
        })
    }

    getcurrentLocation() {
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

    handleOptionChange(e) {
        const selectedValue = e.target.value;
        var cat = ''
        if (selectedValue === 'Utility Poles'){
            cat='utility'
        }
        else if (selectedValue === 'Vehicle'){
            cat='vehicle'
        }
        else if (selectedValue === 'Road'){
            cat='road'
        }
        else if (selectedValue === 'House'){
            cat='house'
        }
        else if (selectedValue === 'All Categories'){
            cat ='all'
        }
        this.setState({
            category: cat
        })
    }

    predictImage() {
        this.setState({
            dataLoading: true,
            returnedPercent: 0,
        })
      
        var self = this;
        const location = this.state.panorama.getPosition();
        const panorama = this.state.panorama;

        const currentPosition = {lat:location.lat(), lng:location.lng()}
        const currentHeading = panorama.getPov().heading;
        const currentPitch = panorama.getPov().pitch;
        const category = this.state.category;
        const serverDomain = this.state.serverDomain;
      
        var eventSource = new EventSource(serverDomain + '/api/virtualtour/predict?coord=' + JSON.stringify(currentPosition)
                                        + "&pitch=" + currentPitch + "&heading=" + currentHeading + "&category=" + category);
        
        eventSource.onmessage = e => {
            if (self.state.firstImageReturned === false) {
                modal.showInfo("Images are being streamed! See the progress bar below!", "success", "top", "center");
            }

            if (e.data === 'END-OF-STREAM') {
                if (self.state.returnedPercent !== 100) {
                    modal.showInfo("Something went wrong while loading images. Streaming stopped at " + self.state.returnedPercent + "%!", "danger", "top", "center");
                }
                eventSource.close()
                self.setState({
                    serverError: false,
                    dataLoading: false,
                })
            } else {
                var jsonData = JSON.parse(e.data)
                if (self.state.imageList.length === 5) {
                    self.setState({
                        imageList: self.state.imageList.slice(1)
                    })
                }
                self.setState({
                    imageList: update(self.state.imageList, {$push: [{
                        original: 'data:image/jpg;base64,' + jsonData.image,
                        thumbnail: 'data:image/jpg;base64,' + jsonData.image,
                    }]
                    }),
                    returnedPercent: Math.round(jsonData.progress),
                    imageHasObjects: jsonData.hasObjects,
                })
            }
        
            self.setState({
                serverError: false,
                firstImageReturned: true
            })
        }
    
        eventSource.onerror = e => {
            eventSource.close()
            modal.showInfo("Error while connecting with the server!", "danger", "top", "center");
            self.setState({
                serverError: true,
                dataLoading: false,
            });
        }
    }

    onMapClicked(mapProps, map, clickEvent) {
        this.setState({
            currentPosition: {lat: clickEvent.latLng.lat(), lng: clickEvent.latLng.lng()},
            panorama: new window.google.maps.StreetViewPanorama(
                this.pano.current,
                {
                    position: {lat: clickEvent.latLng.lat(), lng: clickEvent.latLng.lng()},
                    pov: {
                        heading: 50,
                        pitch: 16,
                    },
                    addressControl: false,
                    visible: true
                }
            )
        })

        map.panTo(clickEvent.latLng);
    };

    onMarkerDrag(coord, map) {
        this.setState({
            currentPosition: {lat: coord.latLng.lat(), lng: coord.latLng.lng()},
            panorama: new window.google.maps.StreetViewPanorama(
                this.pano.current,
                {
                    position: {lat: coord.latLng.lat(), lng: coord.latLng.lng()},
                    pov: {
                        heading: 50,
                        pitch: 16,
                    },
                    addressControl: false,
                    visible: true
                }
            )
        })
    }
    
    render() {

        const imageList = this.state.imageList;
        const firstImageReturned = this.state.firstImageReturned;
        const returnedPercent = this.state.returnedPercent;
        const serverError = this.state.serverError;
        const dataLoading = this.state.dataLoading;
        // const imageHasObjects = this.state.imageHasObjects;
        const currentPosition = this.state.currentPosition;
        
        var predictButtonText = ""
        if (dataLoading === false) {
            predictButtonText = "Predict"
        } else {
            predictButtonText = "Loading..."
        }

        var helpText = 'No predictions. Navigate around the map and click "Predict" to start.'

        if (!this.props.google) {
            return <div>Loading...</div>;
        }
        
        return (
        <div className="page-container">
            <div className="row">
                <div className="col-md-6 map-view-container">
                    <div className="map-top-center">
                        <button onClick={this.predictImage.bind(this)} disabled={dataLoading} className="btn btn-primary">{predictButtonText}</button>
                        <select defaultValue="Utility Poles" onChange={this.handleOptionChange.bind(this)} disabled={dataLoading}>
                            <option value="Utility Poles">Utility Poles</option>
                            <option value="Vehicle">Vehicle</option>
                            <option value="Road">Road</option>
                            <option value="House">House</option>
                            <option value="All Categories">All Categories</option>
                        </select>
                    </div>
                    <div className="map-container">
                        <Map
                            google={this.props.google} 
                            initialCenter={currentPosition}
                            zoom={14}
                            onClick={this.onMapClicked.bind(this)}
                            streetViewControl={false}
                        >
                            <Marker
                                position={currentPosition}
                                icon={{
                                    url: process.env.PUBLIC_URL + '/img/human_marker.png',
                                    scaledSize: new window.google.maps.Size(30, 30)
                                }}
                                draggable={true}
                                onDragend={(t, map, coord) => this.onMarkerDrag(coord, map)}
                            />
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
                        {/* {imageHasObjects === false && (
                        <div>
                            The returned image does not contain any objects for the selected category.
                        </div>
                        )} */}
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
                <div className="col-md-6 pano-view-container">
                    <div id="pano" ref={this.pano}></div>
                </div>
            </div>
        </div>
        );
    }
}
export default GoogleApiWrapper({
    apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
    v: "3.30"
  })(VirtualTour);