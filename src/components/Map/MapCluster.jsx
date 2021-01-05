import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper, InfoWindow, Polygon } from "google-maps-react"
import ImageGallery from 'react-image-gallery'
import update from 'immutability-helper'
import axios from 'axios'
import $ from 'jquery'

import { server } from '../../controllers/Server.js'
import { modal } from '../../utilities/modal.js'

import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import { FastRewindTwoTone } from "@material-ui/icons"

export class MapCluster extends Component {
    constructor(props) {
        super(props);
        this.pano= React.createRef();
        this.polygonRef = React.createRef();
        this.polygonInfoWindowRef = React.createRef();
        this.onPolygonMouseOver = this.onPolygonMouseOver.bind(this);
        this.onPolygonMouseOut = this.onPolygonMouseOut.bind(this);
        this.onInfoWindowClose = this.onInfoWindowClose.bind(this)
        this.state = {
            serverDomain: server.getServerDomain(),
            loadingData: false,
            initialMessage: "Loading the neighborhoods. Please wait...",
            showingInfoWindow: false,
            activeMarker: {},
            showingInfoWindowPolygon: false,
            activePolygonPosition: {},
            currentLocation:  {lat: 39.0410436302915, lng: -94.5876739197085},
            currentRectangle: [],
            rectangle_coords: [],
            allNeighborhoodsCoords: [],
            neighborhoodList:[],
        };
    }
    
    componentDidMount() {
        this.setState({
            loadingData: true
        })
        this.loadNeighborhoodList()
    }

    loadNeighborhoodList() {
        var self = this;
    
        axios.get(this.state.serverDomain + "/api/neighborhoods/clusters/get")
        .then(function(response) {
            response.data.forEach(function(item) {
                console.log(item)
            })
            self.setState({
                neighborhoodList: response.data,
                loadingData: false,
            })
        })
        .catch(function(e) {
            self.setState({
                initialMessage: "Cannot load the neighborhoods!"
            })
            modal.showInfo("Cannot load the neighborhoods!", "danger", "top", "center");
        })
    }

    setPolygonOptions = (options) => {
        this.polygonRef.current.polygon.setOptions(options);
    };

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
   
    onPolygonMouseOver(props, polygon, e){
        console.log('hovered')
        // console.log(this.state.polygonIsHovered)
        this.setPolygonOptions({
            // fillColor: "green",
            paths:props.paths
        });
    }

    onPolygonMouseOut(props, polygon, e){
        this.setPolygonOptions({
            // fillColor: "green",
            paths:[]
        });
    }

    onInfoWindowClose(){
         this.setState({
                    showingInfoWindowPolygon: false,
                    activePolygonPosition: null,
        })
    }

    render() {
        const loadingData = this.state.loadingData;

        if (!this.props.google) {
            return <div>Loading...</div>;
        }

        return (
        <div className="page-container">
            {loadingData == false ? (
            <div className="row">
                <div className="col-md-8 map-view-container" style = {{height: "95vh"}}>
                    <div className="map-container">
                        <Map
                            google={this.props.google}
                            initialCenter={this.state.currentLocation}
                            center={this.state.currentLocation}
                            zoom={14}
                        >
                            {/* {neighborhoodInfo.map(region => {
                                const coords = region.geometry.coordinates[0][0]
                                let coord_arr = []
                                coords.map(coord => {
                                // console.log({
                                //   lat: coord[1], lng: coord[0]
                                // })
                                coord_arr.push({
                                    lat: coord[1], lng: coord[0]
                                })
                                // console.log(coord_arr)

                                })

                                var randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
                                return (<Polygon
                                ref = {React.createRef()}
                                nbh_id = {region.properties.nbhid}
                                paths={coord_arr}
                                strokeColor={randomColor}
                                strokeOpacity={0.8}
                                strokeWeight={1.75}
                                fillColor={randomColor}
                                fillOpacity={0.5}
                                onMouseover = {this.onPolygonMouseOver}
                                onMouseout = {this.onPolygonMouseOut}
                                />)
                            })}

                            <InfoWindow
                                marker={this.state.activeMarker}
                                visible={this.state.showingInfoWindow}
                            >
                                {this.state.infoWindowContent}
                            </InfoWindow>

                            <Polygon
                                ref={this.polygonRef}
                                onClick={this.handleClick}
                                paths={rectangle}
                                strokeColor="#0000FF"
                                strokeOpacity={0.8}
                                strokeWeight={2}
                                fillColor="#0000FF"
                                fillOpacity={0.35}
                            /> */}
                        </Map>
                    </div>
                </div>
                <div className="col-md-3" align="center">
                    Slide Bar HERE
                </div>
            </div>
            ) : (
            <div align="center">
                {this.state.initialMessage}
            </div>
            )}
        </div>
        );
    }
}
export default GoogleApiWrapper({
    apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
    v: "3.30"
})(MapCluster);