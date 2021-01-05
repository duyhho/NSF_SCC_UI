import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper, InfoWindow, Polygon } from "google-maps-react"
import ImageGallery from 'react-image-gallery'
import update from 'immutability-helper'
import axios from 'axios'
import $ from 'jquery'

import { server } from '../../controllers/Server.js'
import { modal } from '../../utilities/modal.js'

import ProgressBar from '../ProgressBar/ProgressBar.jsx'

export class Map311 extends Component {
    constructor(props) {
        super(props);
        this.pano= React.createRef();
        this.polygonRef = React.createRef();
        this.polygonInfoWindowRef = React.createRef();
        this.onPolygonMouseOver = this.onPolygonMouseOver.bind(this);
        this.onPolygonMouseOut = this.onPolygonMouseOut.bind(this);
        this.onPolygonClick = this.onPolygonClick.bind(this);
        this.onInfoWindowClose = this.onInfoWindowClose.bind(this)
        this.state = {
            serverDomain: server.getServerDomain(),
            processedData: [],
            firstImageReturned: false,
            imageList: [],
            returnedPercent: 0,
            dataLoading: false,
            serverError: true,
            showingInfoWindow: false,
            activeMarker: {},
            showingInfoWindowPolygon: false,
            activePolygonPosition: {},
            currentLocation:  {lat: 39.0410436302915, lng: -94.5876739197085},
            currentAddress: "",
            currentRectangle: [],
            category: "utility",
            firstLoad: true,
            rectangle_coords: [],
            allNeighborhoodsCoords: [],
            panorama: null,
            showAllNeighborhoods: false,
            neighborhoodList:[],
            neighborhoodInfo: [],
        };
    }
    
    componentDidMount() {
        if (this.state.firstLoad === true) {
            this.processData();
        }

        this.loadNeighborhoodList()
        this.loadNeighborhoodInfo()

        this.setState({
            firstLoad: false,
        })
    }

    processData() {
        var self = this;

        axios.get(this.state.serverDomain + "/api/311/get")
        .then(function(response) {
            self.setState({
                processedData: response.data,
                serverError: false,
                currentLocation: response.data[0],
                currentAddress: response.data[0].address + ", Kansas City, MO " + response.data[0].zip_code
            })
            new window.google.maps.StreetViewPanorama(
                document.getElementById("pano"),
                {
                    position: response.data[0],
                    pov: {
                        heading: 34,
                        pitch: 10,
                    },
                    addressControl: false
                }
            )
        })
        .catch(function(error) {
            modal.showInfo("Error while connecting with the server!", "danger", "top", "center");
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
        const serverDomain = this.state.serverDomain;
      
        var eventSource = new EventSource(serverDomain + "/api/311/predict?category=" + category + '&address=' + currentAddress);

        
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
                $("#neighborhood_select").val("Custom Prediction")
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
            eventSource.close()
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
                        ),
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

    loadNeighborhoodInfo(){
        var self = this
        axios.get(this.state.serverDomain + "/api/neighborhoods/get")
        .then(function(response) {
            console.log(response.data);
            self.setState({
              neighborhoodInfo: response.data,
            })
        })
        .catch(function(error) {
            modal.showInfo("Cannot load the neighborhood infos!", "danger", "top", "center");
        })
    }

    loadNeighborhoodList() {
        var self = this;
    
        axios.get(this.state.serverDomain + "/api/community/get")
        .then(function(response) {
            self.setState({
              neighborhoodList: response.data,
            })
        })
        .catch(function(error) {
          modal.showInfo("Cannot load the neighborhood list!", "danger", "top", "center");
        })
    }

    handleNeighborhoodChange(e) {
        var self = this;
        const selectedValue = e.target.value;
        const neighborhoodList = this.state.neighborhoodList;

        if (selectedValue !== "Custom Prediction") {
            if (selectedValue === "None") {
                self.setState(prev => ({
                    rectangle_coords: [],
                    showAllNeighborhoods: false
                }));
            } else if (selectedValue === "All Neighborhoods") {
                self.setState(prev => ({
                    rectangle_coords: [],
                    showAllNeighborhoods: true
                }));
            } else {
                neighborhoodList.forEach(function(item) {
                    if (item.name === selectedValue) {
                        self.setState(prev => ({
                            rectangle_coords: [
                                item.start,
                                {lat: item.start.lat, lng: item.end.lng},
                                item.end,
                                {lat: item.end.lat, lng: item.start.lng}
                            ],
                            showAllNeighborhoods: false
                        }));
                    }
                })
            }
        }
    }

    onPolygonMouseOver(props, polygon, e){
        this.setPolygonOptions({
            paths:props.paths
        });
        // console.log(props.center)
        var self = this;
        const neighborhoodInfo = this.state.neighborhoodInfo;

        neighborhoodInfo.forEach(function(location) {
            if (location.properties.nbhid === props.nbh_id) {
                // console.log(self.state.showingInfoWindowPolygon)

                if (self.state.showingInfoWindowPolygon == false) {
                    self.setState({
                        // activePolygonPosition: {lat: location.geometry.coordinates[0][0][0][0], lng: location.geometry.coordinates[0][0][0][1]},
                        showingInfoWindowPolygon: true,
                        // infoWindowContentPolygon: (
                        // <div>
                        //     <h2>{location.properties.nbhname}</h2>
                        // </div>
                        // ),
                    });
                }
                self.polygonInfoWindowRef.current.infowindow.setOptions({
                    content: location.properties.nbhname,
                    visible: true,
                    position:  props.center_coord,
                })
                
                // console.log(self.polygonInfoWindowRef.current.infowindow.visible)
                // self.polygonInfoWindowRef.current.infowindow.setPosition(props.center_coord)
                // console.log(self.polygonInfoWindowRef.current.infowindow)
                
            }
        })
        
      }
   
    onPolygonMouseOut(props, polygon, e){
        // this.setPolygonOptions({
        //     paths:[]
        // });
        // this.polygonInfoWindowRef.current.infowindow.setOptions({
        //     content: 'Nothing',
        //     visible: false,
        //     position:  props.center_coord,
        //     maxWidth: 0
        // })

        // console.log(self.polygonInfoWindowRef.current.infowindow)
        // if (this.state.dataLoading === false) {
        //     if (this.state.showingInfoWindowPolygon) {
        //         this.setState({
        //             showingInfoWindowPolygon: false,
        //             activePolygonPosition: null,
        //         })
        //     }
        // }
    }
    onInfoWindowClose(){
         this.setState({
                    showingInfoWindowPolygon: false,
                    activePolygonPosition: null,
        })
    }
    onPolygonClick(props, polygon, e){
        var self = this;
        const neighborhoodInfo = this.state.neighborhoodInfo;
        // console.log(self.polygonInfoWindowRef.current.infowindow.position.lat())
        console.log(props.center_coord)
        neighborhoodInfo.forEach(function(location) {
            if (location.properties.nbhid === props.nbh_id) {
                console.log(location.properties.nbhname)
                self.polygonInfoWindowRef.current.infowindow.setOptions({
                    content: location.properties.nbhname,
                    visible: true,
                    position:  props.center
                })
                console.log(self.polygonInfoWindowRef.current.infowindow.position.lat())
                self.setState({
                    // activePolygonPosition: {lat: location.geometry.coordinates[0][0][0][0], lng: location.geometry.coordinates[0][0][0][1]},
                    showingInfoWindowPolygon: true,
                    // infoWindowContentPolygon: (
                    // <div>
                    //     <h2>{location.properties.nbhname}</h2>
                    // </div>
                    // ),
                });
            }
        })
    }

    render() {
        // Dummy Data (used when no server is around)
        // const processedData = JSON.parse('[{"case_id": 2020117327, "request_type": "Trees-Storm Damage-Tree Down", "date": "08/29/2020", "time": "10:42 PM", "lat": 39.04231736302915, "lng":  -94.5876839197085, "address": "7370 NE 76th St", "zip_code": 64119.0, "neighborhood": "Shoal Creek", "county": "Clay"}, {"case_id": 2020117327, "request_type": "Trees-Storm Damage-Tree Down", "date": "08/29/2020", "time": "10:42 PM", "lat": 39.2339117, "lng": -94.5428878, "address": "7370 NE 76th St", "zip_code": 64119.0, "neighborhood": "Shoal Creek", "county": "Clay"}]');
        // const currentLocation =  {lat: 39.0410436302915, lng: -94.5876739197085};
        // const currentAddress = 'UMKC';
        const processedData = this.state.processedData;
        const imageList = this.state.imageList;
        const firstImageReturned = this.state.firstImageReturned;
        const returnedPercent = this.state.returnedPercent;
        const serverError = this.state.serverError;
        const currentLocation = this.state.currentLocation;
        const currentAddress = this.state.currentAddress;
        const dataLoading = this.state.dataLoading;
        const rectangle = this.state.rectangle_coords;
        const neighborhoodList = this.state.neighborhoodList;
        const neighborhoodInfo = this.state.neighborhoodInfo;

        const allNeighborhoodsCoords = this.state.allNeighborhoodsCoords;

        var predictButtonText = ""
        if (dataLoading === false) {
            predictButtonText = "Predict"
        } else {
            predictButtonText = "Loading..."
        }

        var helpText = 'No predictions. Select a location on the map and click "Predict" to start.'

        if (!this.props.google) {
            return <div>Loading...</div>;
        }

        return (
        <div className="page-container">
            {processedData.length > 0 ? (
            <div>
                <div className="neighborhood-select-2">
                    <select id="neighborhood_select" defaultValue="None" onChange={this.handleNeighborhoodChange.bind(this)} disabled={dataLoading}>
                        <option value={"None"}>None</option>
                        <option disabled value={"Custom Prediction"}>Custom Prediction</option>
                        {
                        neighborhoodList.map(function(item) {
                            return <option value={item.name}>{item.name}</option>
                        })
                        }
                        <option value={"All Neighborhoods"}>All Neighborhoods</option>
                    </select>
                </div>
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
                                initialCenter={{"lat":39.08078758473217,"lng":-94.55568075124583}}
                                zoom={14}
                                onClick={this.onMapClicked.bind(this)}
                                streetViewControl = {false}
                            >
                            {neighborhoodInfo.map(region => {
                            const coords = region.geometry.coordinates[0][0]
                            let coord_arr = []; let x_coords = []; let y_coords = []
                            coords.forEach(coord => {
                                coord_arr.push({
                                    lat: coord[1], lng: coord[0]
                                });
                                x_coords.push(coord[0]);
                                y_coords.push(coord[1])
                            })
                            // console.log(x_coords)
                        
                            const x_min = Math.min(...x_coords);
                            const y_min = Math.min(...y_coords);
                            const x_max = Math.max(...x_coords);
                            const y_max = Math.max(...y_coords);
                            // console.log(x_min)
                            const center = {
                                lat: y_min + ((y_max - y_min) / 2),
                                lng: x_min + ((x_max - x_min) / 2),
                            }
                            // console.log(coord_arr, center)
                            
                            var randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
                            return (<Polygon
                                ref = {React.createRef()}
                                center_coord = {center}
                                nbh_id = {region.properties.nbhid}
                                paths={coord_arr}
                                strokeColor={randomColor}
                                strokeOpacity={0.8}
                                strokeWeight={1.75}
                                fillColor={randomColor}
                                fillOpacity={0.5}
                                onMouseover = {this.onPolygonMouseOver}
                                onMouseout = {this.onPolygonMouseOut}
                                onClick = {this.onPolygonClick}
                            />)
                        })}
                            {processedData.map((location) =>
                            <Marker
                                position={{lat: location.lat, lng: location.lng}}
                                caseId={location.case_id}
                                icon={{
                                url: process.env.PUBLIC_URL + '/img/case_active/' + location.category + '.png',
                                // url: process.env.PUBLIC_URL + '/img/case_active/case_active_icon_2.png',
                                scaledSize: new window.google.maps.Size(25, 25)
                                }}
                                onClick={this.onMarkerClick.bind(this)}
                            />
                            )}

                            <InfoWindow
                                marker={this.state.activeMarker}
                                visible={this.state.showingInfoWindow}
                            >
                                
                            </InfoWindow>

                            <InfoWindow
                                ref={this.polygonInfoWindowRef}
                                position={ {lat: 39.0410436302915, lng: -94.5876739197085} }
                                visible={this.state.showingInfoWindowPolygon}
                                onClose={this.onInfoWindowClose}
                            >
                                {/* {this.state.infoWindowContentPolygon} */}
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

                            {this.state.showAllNeighborhoods === true && (
                            <Polygon
                                ref={this.polygonRef}
                                paths={allNeighborhoodsCoords}
                                strokeColor="#0000FF"
                                strokeOpacity={0.8}
                                strokeWeight={2}
                                fillColor="#0000FF"
                                fillOpacity={0.35}
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
                    <div className="col-md-6 pano-view-container" align="center">
                        <div id="pano" ref = {this.pano}></div>
                    </div>
                    <div className="col-md-6 currentSelectedLocationDiv" align="left">
                        <div className = 'col-md-10'>
                            <div align="center" style = {{fontWeight: 'bold', fontSize: '1.15vw'}}>CURRENT SELECTED LOCATION</div>
                            <br />
                            <div className="row">
                                <div className="col-md-6 desc1">
                                    <b>Location:</b>
                                </div>
                                <div className="col-md-6 desc2">
                                    {currentAddress + ", " + currentLocation.neighborhood + ", " + currentLocation.county + " County"}
                                </div>
                            </div>
                            {/* <br /> */}
                            <div className="row" style={{marginTop:"1vh"}}>
                                <div className="col-md-6 desc1">
                                    <b>Request Type:</b>
                                </div>
                                <div className="col-md-6 desc2">
                                    {currentLocation.request_type}
                                </div>
                            </div>
                            {/* <br /> */}
                            <div className="row" style={{marginTop:"1vh"}}>
                                <div className="col-md-6 desc1">
                                   <b>Submitted: </b>
                                </div>
                                <div className="col-md-6 desc2">
                                    {currentLocation.date + ", " + currentLocation.time}
                                </div>
                            </div>
                            <div className="row" style={{marginTop:"1vh"}}>
                                <div className="col-md-6 desc1">
                                   <b>Category: </b>
                                </div>
                                <div className="col-md-6 desc2">
                                    {currentLocation.category}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ) : (
            <div align="center">
                Cannot load page due to server error!
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