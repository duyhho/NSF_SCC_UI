import React, { Component } from "react"
import { Map, GoogleApiWrapper, Polygon } from "google-maps-react"
import update from 'immutability-helper'
import axios from 'axios'
import Slider from '@material-ui/core/Slider';

import { server } from '../../controllers/Server.js'
import { modal } from '../../utilities/modal.js'

export class MapCluster extends Component {
    constructor(props) {
        super(props);
        this.polygonRef = React.createRef();
        this.onPolygonMouseOver = this.onPolygonMouseOver.bind(this);
        this.onPolygonMouseOut = this.onPolygonMouseOut.bind(this);
        this.onPolygonClick = this.onPolygonClick.bind(this);
        this.state = {
            serverDomain: server.getServerDomain(),
            loadingData: false,
            initialMessage: "Loading the block groups. Please wait...",
            currentLocation: {lat: 39.0410436302915, lng: -94.5876739197085},
            neighborhoodList:[],
            sliderLabels: [],
            currentCluster: [],
            colorArray: ['#FF8C00', '#E81123', '#EC008C', '#68217A', '#00188F',
                        '#00BCF2', '#00B294', '#BAD80A', '#009E49', '#FFF100'],
            categoryList: [{cat: "311 Call Category"}, {cat: "311 Response Time"}, {cat: "311 Call Frequency"}, {cat: "Census Socioeconomic Metrics"}, {cat: "All Factors"}],
            currentCategory: "Cluster by Socioeconomic Metrics",
            showingInfoWindow: false,
            selectedNeighborhood: null,
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
    
        // axios.get(this.state.serverDomain + "/api/blockgroups/clusters/get")
        axios.get('https://dl.dropboxusercontent.com/s/5dyq70p4l5ptkah/230BG-Clusters.json?dl=0')
        .then(function(response) {
            for (var i = 2; i <= response.data.length + 1; i++) {
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
                initialMessage: "Cannot load the block groups!"
            })
            modal.showInfo("Cannot load the block groups!", "danger", "top", "center");
        })
    }

    setPolygonOptions = (options) => {
        this.polygonRef.current.polygon.setOptions(options);
    };

    onSliderLabelChange(event, value) {
        var self = this;
        this.state.neighborhoodList.forEach(function(item) {
            if (item.Cluster_Total === value) {
                self.setState({
                    currentCluster: item,
                })
            }
        })

        this.setState({
            showingInfoWindow: false,
        })
    }

    handleCategoryChange(e) {
        const selectedValue = e.target.value;
        var currentCluster = this.state.currentCluster
        const oldCluster = this.state.currentCluster
        var keys = Object.keys(currentCluster)
        keys.forEach(function(key) {
            if (key !== 'Cluster_Total'){
                currentCluster[key]['Boundaries'][0][0] += 0.00000000000001
            }
        })

        this.setState({
            currentCluster: currentCluster
        })
        this.setState({
            currentCluster: oldCluster
        })

        if (selectedValue === "311 Call Category") {
            this.setState({
                currentCategory: "Cluster by Call Category"
            })
        } else if (selectedValue === "311 Response Time") {
            this.setState({
                currentCategory: "Cluster by Response Time"
            })
        } else if (selectedValue === "311 Call Frequency") {
            this.setState({
                currentCategory: "Cluster by Call Frequency"
            })
        } else if (selectedValue === "Census Socioeconomic Metrics") {
            this.setState({
                currentCategory: "Cluster by Socioeconomic Metrics"
            })
        } else if (selectedValue === "All Factors") {
            this.setState({
                currentCategory: "Cluster by All Factors"
            })
        }

        this.setState({
            showingInfoWindow: false,
        })
    }

    onPolygonMouseOver(props, polygon, e){
        this.setPolygonOptions({
            paths: props.paths
        });
    }

    onPolygonMouseOut(props, polygon, e){
        this.setPolygonOptions({
            paths: []
        });
    }

    onPolygonClick(props, polygon, e){
        var self = this;
        const currentCluster = this.state.currentCluster;

        Object.keys(currentCluster).forEach(bg => {
            if (bg === "Cluster_Total") {
                //SKIP
            } else {
                if (currentCluster[bg]["BLOCKGROUP_ID"] === props.nbhId) {
                    self.setState({
                        selectedNeighborhood: currentCluster[bg]
                    });
                }
            }
        })
    }

    render() {
        const loadingData = this.state.loadingData;
        const currentCluster = this.state.currentCluster;
        const categoryList = this.state.categoryList;
        const currentColorArray = this.state.colorArray.slice(0, currentCluster['Cluster_Total']);
        const selectedNeighborhood = this.state.selectedNeighborhood;
        
        if (!this.props.google) {
            return <div>Loading...</div>;
        }

        return (
        <div className="page-container">
            {loadingData === false ? (
            <div className="row">
                <div className="col-md-6 map-view-container" style = {{height: "95vh"}}>
                    <div className="map-container">
                        <Map
                            google={this.props.google}
                            initialCenter={this.state.currentLocation}
                            zoom={11}
                        >
                            {Object.keys(currentCluster).map(bg => {
                                if (bg === "Cluster_Total") {
                                    return <div></div>;
                                } else {
                                    const coords = currentCluster[bg]["Boundaries"]
                                    var coordArr = []
                                    var x_coords = []
                                    var y_coords = []

                                    coords.forEach(function(coord) {
                                        coordArr.push({
                                            lat: coord[0], lng: coord[1]
                                        });
                                        x_coords.push(coord[1]);
                                        y_coords.push(coord[0]);
                                    })

                                    const x_min = Math.min(...x_coords);
                                    const y_min = Math.min(...y_coords);
                                    const x_max = Math.max(...x_coords);
                                    const y_max = Math.max(...y_coords);
                                    const center = {
                                        lat: y_min + ((y_max - y_min) / 2),
                                        lng: x_min + ((x_max - x_min) / 2),
                                    }
                            
                                    return (
                                        <Polygon
                                            ref={this.polygonRef}
                                            nbhId={currentCluster[bg]["BLOCKGROUP_ID"]}
                                            centerCoord={center}
                                            paths={coordArr}
                                            strokeColor={this.state.colorArray[currentCluster[bg][this.state.currentCategory] - 1]}
                                            strokeOpacity={1}
                                            strokeWeight={3}
                                            fillColor={this.state.colorArray[currentCluster[bg][this.state.currentCategory] - 1]}
                                            fillOpacity={0.75}
                                            // onMouseover={this.onPolygonMouseOver}
                                            // onMouseout={this.onPolygonMouseOut}
                                            onClick = {this.onPolygonClick}
                                        />
                                    )
                                }
                            })}
                        </Map>
                        <div className="legend" align="center">
                            <h3>Legend</h3>
                        {
                        currentColorArray.map(function(color, index) {
                            return (
                                <div className="legend-item">
                                    <div className="legend-color" style={{backgroundColor: color}}></div>
                                    <div>Cluster {index + 1}</div>
                                </div>
                            )
                        })
                        }
                        </div>
                    </div>
                </div>
                <div className="col-md-5" align="center" style={{marginTop: "20px"}}>
                    <div align="center">
                        <span>Cluster By:&nbsp;&nbsp;</span>
                        <select defaultValue="Census Socioeconomic Metrics" onChange={this.handleCategoryChange.bind(this)}>
                        {
                        categoryList.map(function(item) {
                            return <option value={item.cat}>{item.cat}</option>
                        })
                        }
                        </select>
                    </div>
                    <br />
                    <div align="center">
                        <span>Number of clusters:</span>
                        <Slider
                            defaultValue={2}
                            aria-labelledby="discrete-slider-custom"
                            step={null}
                            marks={this.state.sliderLabels}
                            valueLabelDisplay="auto"
                            min={2}
                            max={this.state.sliderLabels.length + 1}
                            onChangeCommitted={this.onSliderLabelChange.bind(this)}
                        />
                    </div>
                    {selectedNeighborhood !== null && (
                    <div className="col-md-12" align="left" style = {{fontSize: "130%"}}>
                        <div align="center" style={{fontWeight: 'bold'}}>CURRENT SELECTED BLOCKGROUP PROFILE</div>
                        <br />
                        <div className="row bgrow">
                            <div className="col-md-9" >
                                <b>Blockgroup ID:</b>
                            </div>
                            <div className="col-md-3">
                                {selectedNeighborhood["BLOCKGROUP_ID"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9">
                                <b>Total Population:</b>
                            </div>
                            <div className="col-md-3"  >
                                {selectedNeighborhood["Total population"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9" style = {{fontSize: "90%"}}>
                                <b>&emsp;White Alone:</b>
                            </div>
                            <div className="col-md-3" style = {{fontSize: "90%"}}>
                                {selectedNeighborhood["White alone"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9" style = {{fontSize: "90%"}}>
                                <b>&emsp;Black or African American Alone:</b>
                            </div>
                            <div className="col-md-3" style = {{fontSize: "90%"}}>
                                {selectedNeighborhood["Black or African American alone"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9" style = {{fontSize: "90%"}}>
                                <b>&emsp;Hispanic or Latino Alone:</b>
                            </div>
                            <div className="col-md-3" style = {{fontSize: "90%"}}>
                                {selectedNeighborhood["Hispanic or Latino"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9" style = {{fontSize: "90%"}}>
                                <b>&emsp;Asian Alone:</b>
                            </div>
                            <div className="col-md-3" style = {{fontSize: "90%"}}>
                                {selectedNeighborhood["Asian alone"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9" style = {{fontSize: "90%"}}>
                                <b>&emsp;Total population a Bachelor's degree or higher (age 25+):</b>
                            </div>
                            <div className="col-md-3" style = {{fontSize: "90%"}}>
                                {selectedNeighborhood["Total population age 25+ years with a bachelor's degree or higher"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9">
                                <b>Number of Households:</b>
                            </div>
                            <div className="col-md-3">
                                {selectedNeighborhood["Household_Type"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9">
                                <b>Median Home Value:</b>
                            </div>
                            <div className="col-md-3">
                                ${selectedNeighborhood["Median home value"].toLocaleString('en')}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9">
                                <b>Median Income:</b>
                            </div>
                            <div className="col-md-3">
                                ${selectedNeighborhood["Median income"].toLocaleString('en') }
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9">
                                <b>Number of Renters:</b>
                            </div>
                            <div className="col-md-3">
                                {selectedNeighborhood["Total Renter Occupied"]}
                            </div>
                        </div>
                        <div className="row bgrow">
                            <div className="col-md-9">
                                <b>Total Vacant Houses:</b>
                            </div>
                            <div className="col-md-3">
                                {selectedNeighborhood["Total Vacant"]}
                            </div>
                        </div>
                        
                        
                    </div>                   
                    )}
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