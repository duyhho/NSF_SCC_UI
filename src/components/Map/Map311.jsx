import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper, InfoWindow, Polygon } from "google-maps-react"
import ImageGallery from 'react-image-gallery'
import update from 'immutability-helper'
import axios from 'axios'
import ReactStreetview from 'react-streetview';

import { modal } from '../../utilities/modal.js'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'

export class Map311 extends Component {
    constructor(props) {
        super(props);

        this.polygonRef = React.createRef();
        this.state = {
            serverDomain: "http://bb4b4fe62b36.ngrok.io",
            processedData: [],
            firstImageReturned: false,
            imageList: [],
            returnedPercent: 0,
            dataLoading: false,
            serverError: true,
            rawData: null,
            showingInfoWindow: false,
            activeMarker: {},
            currentLocation: {},
            currentAddress: "",
            currentRectangle: [],
            category: "utility",
            firstLoad: true,
            rectangle_coords: [],
            loadingImageError: false,
        };
    }
    
    componentDidMount() {
        if (this.state.firstLoad === true) {
            this.processData();
        }
        this.setState({
            firstLoad: false,
        })
    }

    processData() {
        var self = this;

        axios.get(this.state.serverDomain + "/api/311/get/all")
        .then(function(response) {
            self.setState({
                processedData: response.data,
                serverError: false,
                currentLocation: response.data[0],
                currentAddress: response.data[0].address + ", Kansas City, MO " + response.data[0].zip_code
            })
        })
        .catch(function(error) {
            modal.showInfo("Error while connecting with the server!", "danger", "top", "center");
            self.setState({
                serverError: true
            })
        })
    }

    sendLocation() {
        this.setState({
            imageList: [],
            dataLoading: true,
            returnedPercent: 0,
        })
      
        var self = this;
        const currentAddress = this.state.currentAddress;
        const category = this.state.category;
        var serverDomain = this.state.serverDomain;
      
        if (serverDomain.search('https') === -1){
            serverDomain = serverDomain.replace("http", 'https')
        }
      
        var eventSource = new EventSource(serverDomain + "/api/311/predict?category=" + category + 
                                        '&address=' + currentAddress);

        
        eventSource.onmessage = e => {
            if (self.state.firstImageReturned === false) {
                modal.showInfo("Images are being streamed! See the progress bar below!", "success", "top", "center");
            }

            if (e.data === 'END-OF-STREAM') {
                if (self.state.returnedPercent !== 100) {
                    modal.showInfo("Something went wrong while loading images. Streaming stopped at " + self.state.returnedPercent + "%!", "danger", "top", "center");
                }
                eventSource.close()
                self.setPolygonOptions({
                    paths:[  
                    self.state.rectangle_coords
                ]});
                self.setState({
                    serverError: false,
                    dataLoading: false,
                })
            } else {
                var jsonData = JSON.parse(e.data)
                self.setState({
                    imageList: update(self.state.imageList, {$push: [{
                        original: 'data:image/jpg;base64,' + jsonData.image,
                        thumbnail: 'data:image/jpg;base64,' + jsonData.image,
                    }]
                    }),
                    returnedPercent: Math.round(jsonData.progress),
                    rectangle_coords: [
                        jsonData.bound.northeast,
                        {lat: jsonData.bound.southwest.lat, lng: jsonData.bound.northeast.lng},
                        jsonData.bound.southwest,
                        {lat: jsonData.bound.northeast.lat, lng: jsonData.bound.southwest.lng}
                    ]
                })
            }
        
            self.setState({
                serverError: false,
                firstImageReturned: true
            })
        }
    
        eventSource.onerror = e => {
            modal.showInfo("Error while connecting with the server!", "danger", "top", "center");
            self.setState({
                serverError: true,
                dataLoading: false,
            });
        }
    }

    onMarkerClick(props, marker, e) {
        if (this.state.dataLoading === false) {
            var self = this;
            const processData = this.state.processedData;

            processData.forEach(function(location) {
                if (location.case_id === props.caseId) {
                    self.setState({
                        activeMarker: marker,
                        showingInfoWindow: true,
                        currentLocation: location,
                        currentAddress: location.address + ", Kansas City, MO " + location.zip_code,
                        infoWindowContent: (
                        <div>
                            <h2>Address</h2>
                            <b>{location.address + ", Kansas City, MO " + location.zip_code}</b>
                        </div>
                        )
                    });
                }
            })
        }
    }

    onMapClicked(mapProps, map, clickEvent) {
        if (this.state.dataLoading === false) {
            if (this.state.showingInfoWindow) {
                this.setState({
                    showingInfoWindow: false,
                    activeMarker: null,
                })
            }
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

    setPolygonOptions = (options) => {
        this.polygonRef.current.polygon.setOptions(options);
    };
    
    render() {
        const processedData = this.state.processedData;
        const imageList = this.state.imageList;
        const firstImageReturned = this.state.firstImageReturned;
        const returnedPercent = this.state.returnedPercent;
        const serverError = this.state.serverError;
        const currentLocation = this.state.currentLocation;
        const currentAddress = this.state.currentAddress;
        const dataLoading = this.state.dataLoading;
        const rectangle = this.state.rectangle_coords;
            
        var predictButtonText = ""
        if (dataLoading === false) {
            predictButtonText = "Predict"
        } else {
            predictButtonText = "Loading..."
        }

        // see https://developers.google.com/maps/documentation/javascript
        const googleMapsApiKey = 'AIzaSyDi4YrgqSjrfFnD5Vs3PsmaDg3teg8pmdE';

        // see https://developers.google.com/maps/documentation/javascript/3.exp/reference#StreetViewPanoramaOptions
        const streetViewPanoramaOptions = {
            position: {lat: currentLocation.lat, lng: currentLocation.lng},
            pov: {heading: 100, pitch: 0},
            zoom: 1,
        };
        
        var helpText = 'No predictions. Select a location on the map and click "Predict" to start.'

        if (!this.props.google) {
            return <div>Loading...</div>;
        }
        
        return (
        <div>
            {processedData.length > 0 && (
            <div>
                <div className="row">
                    <div className="col-md-6 map-view-container">
                        <div className="map-top-center">
                            <button onClick={this.sendLocation.bind(this)} disabled={dataLoading} className="btn btn-primary">{predictButtonText}</button>
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
                                initialCenter={{lat: currentLocation.lat, lng: currentLocation.lng}}
                                zoom={11}
                                onClick={this.onMapClicked.bind(this)}
                                streetViewControl = {false}
                            >
                            
                            {processedData.map((location) =>
                            <Marker
                                position={{lat: location.lat, lng: location.lng}}
                                caseId={location.case_id}
                                icon={{
                                url: process.env.PUBLIC_URL + '/img/case_active_icon_2.png',
                                scaledSize: new window.google.maps.Size(15, 15)
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

                            <Polygon
                                ref={this.polygonRef}
                                paths={rectangle}
                                strokeColor="#0000FF"
                                strokeOpacity={0.8}
                                strokeWeight={2}
                                fillColor="#0000FF"
                                fillOpacity={0.35}
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
                        <div className="react-street-view">
                            <ReactStreetview
                                apiKey={googleMapsApiKey}
                                streetViewPanoramaOptions={streetViewPanoramaOptions}
                            />
                        </div>
                    </div>
                    <div className="col-md-5 currentSelectedLocationDiv" align="left">
                        
                        <div className = 'col-md-10'>
                            <div align="center">CURRENT SELECTED LOCATION</div>
                            <br />
                            <div className="row">
                                <div className="col-md-4">
                                    Location:
                                </div>
                                <div className="col-md-8">
                                    {currentAddress + ", " + currentLocation.neighborhood + ", " + currentLocation.county + " County"}
                                </div>
                            </div><br></br>
                            <div className="row">
                                <div className="col-md-4">
                                    Request Type:
                                </div>
                                <div className="col-md-8">
                                    {currentLocation.request_type}
                                </div>
                            </div>
                           <br></br>
                            
                            <div className="row">
                                <div className="col-md-4">
                                    Submitted:
                                </div>
                                <div className="col-md-8">
                                    {currentLocation.date + ", " + currentLocation.time}
                                </div>
                            </div>
                        </div>
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
