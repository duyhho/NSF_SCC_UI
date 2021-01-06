import React, { Component } from "react"
import { Map, Marker, GoogleApiWrapper, InfoWindow, Polygon } from "google-maps-react"
import update from 'immutability-helper'
import axios from 'axios'
import $ from 'jquery'
import Slider from '@material-ui/core/Slider';

import { server } from '../../controllers/Server.js'
import { modal } from '../../utilities/modal.js'

export class MapCluster extends Component {
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
            loadingData: false,
            initialMessage: "Loading the neighborhoods. Please wait...",
            showingInfoWindowPolygon: false,
            activePolygonPosition: {},
            currentLocation:  {lat: 39.0410436302915, lng: -94.5876739197085},
            currentRectangle: [],
            rectangle_coords: [],
            allNeighborhoodsCoords: [],
            neighborhoodList:[],
            sliderLabels: [],
            currentCluster: [],
            colorArray: ['#FF8C00', '#E81123', '#EC008C', '#68217A', '#00188F', '#00B294',
                            '#00BCF2', '#00B294', '#BAD80A', '#009E49', '#FFF100'],
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
            for (var i = 2; i <= response.data.length; i ++) {
                self.setState({
                    sliderLabels: update(self.state.sliderLabels, {$push: [{
                        value: i,
                        label: i,
                    }]
                    }),
                })
            }
            response.data.forEach(function(item) {
                if (item.Cluster_Total === 2) {
                    self.setState({
                        currentCluster: item,
                    })
                }
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

    onMapClicked(mapProps, map, clickEvent) {
        if (this.state.dataLoading === false) {
            if (this.state.showingInfoWindow) {
                this.setState({
                    showingInfoWindow: false,
                })
            }
        }
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

    onInfoWindowClose(){
         this.setState({
            showingInfoWindowPolygon: false,
            activePolygonPosition: null,
        })
    }

    onSliderLabelChange(event, value) {
        var self = this;
        this.state.neighborhoodList.forEach(function(item) {
            if (item.Cluster_Total === value) {
                self.setState({
                    currentCluster: item,
                })
            }
        })
    }

    render() {
        const loadingData = this.state.loadingData;
        var currentCluster = this.state.currentCluster;
        // if (currentCluster.Cluster_Total != 4){
        //     currentCluster = {}
        // }
        
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
                            onClick={this.onMapClicked.bind(this)}
                            zoom={14}
                        >
                            {Object.keys(currentCluster).map(neighborhood => {
                                if (neighborhood == "Cluster_Total") {
                                    //SKIP
                                } else {
                                        const coords = currentCluster[neighborhood]["Polygon_Boundaries"]
                                        var coordArr = []
                                        coords.forEach(function(coord) {
                                            coordArr.push({
                                                lat: coord[1], lng: coord[0]
                                            });
                                        })
                                        return (
                                            <Polygon
                                                ref = {React.createRef()}
                                                nbhName = {currentCluster[neighborhood]["Neighborhood Name"]}
                                                paths={coordArr}
                                                strokeColor={this.state.colorArray[currentCluster[neighborhood]["Neighborhood_Cluster"] - 1]}
                                                strokeOpacity={1}
                                                strokeWeight={3}
                                                fillColor={this.state.colorArray[currentCluster[neighborhood]["Neighborhood_Cluster"] - 1]}
                                                fillOpacity={0.75}
                                                // onMouseover = {this.onPolygonMouseOver}
                                                // onMouseout = {this.onPolygonMouseOut}
                                                // onClick = {this.onPolygonClick}
                                            />
                                        )
                                    }
                                    
                            })}
                        </Map>
                    </div>
                </div>
                <div className="col-md-3" align="center" style={{marginTop: "20px"}}>
                    <span>Number of clusters:</span>
                    <Slider
                        defaultValue={1}
                        aria-labelledby="discrete-slider-custom"
                        step={null}
                        marks={this.state.sliderLabels}
                        valueLabelDisplay="auto"
                        min={2}
                        max={this.state.sliderLabels.length + 1}
                        onChangeCommitted={this.onSliderLabelChange.bind(this)}
                    />
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