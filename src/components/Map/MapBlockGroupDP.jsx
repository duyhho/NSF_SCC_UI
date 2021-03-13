import React, { Component } from "react"
import { Map, GoogleApiWrapper, Polygon, Marker } from "google-maps-react"
import update from 'immutability-helper'
import axios from 'axios'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import { server } from '../../controllers/Server.js'
import { modal } from '../../utilities/modal.js'

export class MapClusterNBH extends Component {
    constructor(props) {
        super(props);
        this.polygonRef = React.createRef();

        this.state = {
            serverDomain: server.getServerDomain(),
            loadingData: false,
            initialMessage: "Loading the block groups. Please wait...",
            currentPosition: {lat: 39.0410436302915, lng: -94.5876739197085},
            blockGroupList:{geometry: {}, data: {}},
            downloadPercent: 0,
            showingInfoWindowPolygon: false,
            infoWindowContent: (<div></div>),
            categoryList: [],
            epsilonList: [],
            currentCategory: "Total population", //Default
            currentEpsilon: "DP-Epsilon=1", //Default
            currentHighest: 0,
            currentLowest: 0,
            differenceList: {},
            colorArray: ["#7e0025", "#a60f16", "#cb181c", "#ef3b2c", "#fb6a4b", "#fd9272", "#ffd1c1", "#feece2", "#bcd6e5", "#6aaed5", "#2070b4"],
            percentArr: [70, 48, 34, 20, 7, 1.4, 0.7, 0, 20, 40, 0],
        };
    }

    componentDidMount() {
        this.setState({
            loadingData: true

        })
        this.loadBlockGroupList()
    }

    loadBlockGroupList() {
        var self = this;

        const client = axios.create({
            baseURL: 'https://dl.dropboxusercontent.com/s/33149z4kcf91s29/Census_validBG_withDP.json?dl=0',
            timeout: 20000
        })

        client.get('https://dl.dropboxusercontent.com/s/33149z4kcf91s29/Census_validBG_withDP.json?dl=0', {
            onDownloadProgress: progressEvent => {
                const percentCompleted = Math.floor(progressEvent.loaded / 15892899  * 100)
                self.setState({
                    downloadPercent: percentCompleted
                })
            }
        })
        .then(function(response) {
            console.log(response.data)

            var catList = []
            Object.keys(response.data.data["Standard"][290370601001]).forEach(cat => {
                catList.push(cat)
            })

            var epsList = []
            var epsNumArr = {}
            var standardNumArr = {}
            Object.keys(response.data.data).forEach(item => {
                if (item.includes("=")) {
                    epsList.push(item)
                }

                if (item == "DP-Epsilon=1") {
                    Object.keys(response.data.data[item]).forEach(group => {
                        epsNumArr[group] = response.data.data[item][group]["Total population"]
                    })
                }
                if (item == "Standard") {
                    Object.keys(response.data.data[item]).forEach(group => {
                        standardNumArr[group] = response.data.data[item][group]["Total population"]
                    })
                }
            })
            var tempList = []
            var difList = {}
            Object.keys(epsNumArr).forEach(group => {
                tempList.push(epsNumArr[group] - standardNumArr[group])
                difList[group] = epsNumArr[group] - standardNumArr[group]
            })
            var curHighest = Math.max(...tempList)
            var curLowest = Math.min(...tempList)

            self.setState({
                blockGroupList: response.data,
                loadingData: false,
                categoryList: catList,
                epsilonList: epsList,
                currentHighest: curHighest,
                currentLowest: curLowest,
                differenceList: difList,
            })
        })
        .catch(function(e) {
            console.log(e)
            self.setState({
                initialMessage: "Cannot load the block groups!"
            })
            modal.showInfo("Cannot load the block groups!", "danger", "top", "center");
        })
    }

    setPolygonOptions = (options) => {
        this.polygonRef.current.polygon.setOptions(options);
    };

    handleCategoryChange(e) {
        this.setState({
            currentCategory: e.target.value
        })

        this.reconfigureData(e.target.value, null)
    }

    handleEpsilonChange(e) {
        this.setState({
            currentEpsilon: e.target.value
        })

        this.reconfigureData(null, e.target.value)
    }

    renderLegend() {
        const currentLowest = this.state.currentLowest;
        const currentHighest = this.state.currentHighest;
        const percentArr = this.state.percentArr;
        var legendLabel = []

        //Start Positive
        legendLabel.push(Math.ceil((currentHighest * percentArr[0] / 100) + 1).toString() + " or more")
        legendLabel.push(Math.ceil((currentHighest * percentArr[1] / 100) + 1).toString() + " to " + Math.ceil((currentHighest * percentArr[0] / 100)).toString())
        legendLabel.push(Math.ceil((currentHighest * percentArr[2] / 100) + 1).toString() + " to " + Math.ceil((currentHighest * percentArr[1] / 100)).toString())
        legendLabel.push(Math.ceil((currentHighest * percentArr[3] / 100) + 1).toString() + " to " + Math.ceil((currentHighest * percentArr[2] / 100)).toString())
        legendLabel.push(Math.ceil((currentHighest * percentArr[4] / 100) + 1).toString() + " to " + Math.ceil((currentHighest * percentArr[3] / 100)).toString())
        legendLabel.push(Math.ceil((currentHighest * percentArr[5] / 100) + 1).toString() + " to " + Math.ceil((currentHighest * percentArr[4] / 100)).toString())
        legendLabel.push(Math.ceil((currentHighest * percentArr[6] / 100) + 1).toString() + " to " + Math.ceil((currentHighest * percentArr[5] / 100)).toString())
        legendLabel.push("1 to " + Math.ceil((currentHighest * percentArr[6] / 100)).toString())

        //Start negative
        legendLabel.push(Math.ceil((currentLowest * percentArr[8] / 100)).toString() + " to 0")
        legendLabel.push(Math.ceil((currentLowest * percentArr[9] / 100)).toString() + " to " + Math.ceil((currentLowest * percentArr[8] / 100) - 1).toString())
        legendLabel.push(Math.ceil((currentLowest * percentArr[9] / 100) - 1).toString() + " or less")

        return this.state.colorArray.map(function(color, index) {
            return (
                <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: color}}></div>
                    <div>{legendLabel[index]}</div>
                </div>
            )
        })
    }

    reconfigureData(newCat, newEps) {
        const blockGroupList = this.state.blockGroupList;
        var currentCategory = "";
        var currentEpsilon = "";
        if (newCat == null) {
            currentCategory = this.state.currentCategory
        } else {
            currentCategory = newCat
        }

        if (newEps == null) {
            currentEpsilon = this.state.currentEpsilon
        } else {
            currentEpsilon = newEps
        }

        var epsNumArr = {}
        var standardNumArr = {}
        Object.keys(blockGroupList.data).forEach(item => {
            if (item == currentEpsilon) {
                Object.keys(blockGroupList.data[item]).forEach(group => {
                    epsNumArr[group] = blockGroupList.data[item][group][currentCategory]
                })
            }
            if (item == "Standard") {
                Object.keys(blockGroupList.data[item]).forEach(group => {
                    standardNumArr[group] = blockGroupList.data[item][group][currentCategory]
                })
            }
        })

        var tempList = []
        var difList = {}
        Object.keys(epsNumArr).forEach(group => {
            tempList.push(epsNumArr[group] - standardNumArr[group])
            difList[group] = epsNumArr[group] - standardNumArr[group]
        })
        var curHighest = Math.max(...tempList)
        var curLowest = Math.min(...tempList)

        this.setState({
            currentHighest: curHighest,
            currentLowest: curLowest,
            differenceList: difList,
        })
    }

    render() {
        var self = this;
        const currentPosition = this.state.currentPosition;
        const loadingData = this.state.loadingData;
        const downloadPercent = this.state.downloadPercent;
        const blockGroupList = this.state.blockGroupList;
        const blockGroupListCoords = blockGroupList.geometry;
        const categoryList = this.state.categoryList;
        const epsilonList = this.state.epsilonList;
        const currentCategory = this.state.currentCategory;
        const currentEpsilon = this.state.currentEpsilon;
        const differenceList = this.state.differenceList;

        if (!this.props.google) {
            return <div>Loading...</div>;
        }

        return (
        <div className="page-container">
            {loadingData === false ? (
            <div>
                <div className="edit-end-button">
                    <select defaultValue="DP-Epsilon=1" onChange={this.handleEpsilonChange.bind(this)}>
                        {
                        epsilonList.map(function(item) {
                            return <option value={item}>{item}</option>
                        })
                        }
                    </select>
                </div>
                <div className="neighborhood-select">
                    <select defaultValue="Total population" onChange={this.handleCategoryChange.bind(this)}>
                        {
                        categoryList.map(function(item) {
                            return <option value={item}>{item}</option>
                        })
                        }
                    </select>
                </div>
                <div className="row">
                    <div className="col-md-12 map-view-container" style = {{height: "95vh"}}>
                        <div className="map-container">
                            <Map
                                google={this.props.google}
                                initialCenter={currentPosition}
                                zoom={11}
                                streetViewControl = {false}
                            >
                                {Object.keys(blockGroupListCoords).map(bg => {
                                    const coords = blockGroupListCoords[bg]["boundaries"]
                                    var coordArr = []
                                    var x_coords = []
                                    var y_coords = []
                                    coords.forEach(function(coord) {
                                        coordArr.push({
                                            lat: coord[0], lng: coord[1]
                                        });
                                        x_coords.push(coord[0]);
                                        y_coords.push(coord[1]);
                                    })

                                    const x_min = Math.min(...x_coords);
                                    const y_min = Math.min(...y_coords);
                                    const x_max = Math.max(...x_coords);
                                    const y_max = Math.max(...y_coords);
                                    const center = {
                                        lat: x_min + ((x_max - x_min) / 2),
                                        lng: y_min + ((y_max - y_min) / 2),
                                    }

                                    return (
                                        <Polygon
                                            ref={self.polygonRef}
                                            paths={coordArr}
                                            center={center}
                                            strokeColor={"green"}
                                            strokeOpacity={1}
                                            strokeWeight={3}
                                            fillColor={"green"}
                                            fillOpacity={0.75}
                                        />
                                    )
                                })}

                                {Object.keys(blockGroupListCoords).map(bg => {
                                    const coords = blockGroupListCoords[bg]["boundaries"]
                                    var x_coords = []
                                    var y_coords = []
                                    coords.forEach(function(coord) {
                                        x_coords.push(coord[0]);
                                        y_coords.push(coord[1]);
                                    })

                                    const x_min = Math.min(...x_coords);
                                    const y_min = Math.min(...y_coords);
                                    const x_max = Math.max(...x_coords);
                                    const y_max = Math.max(...y_coords);
                                    const center = {
                                        lat: x_min + ((x_max - x_min) / 2),
                                        lng: y_min + ((y_max - y_min) / 2),
                                    }

                                    var markerLabel = ""
                                    Object.keys(differenceList).map(group => {
                                        if (group == bg) {
                                            markerLabel = differenceList[group].toString()
                                        }
                                    })

                                    return (
                                        <Marker
                                            label={markerLabel}
                                            position={center}
                                            name={"ASD"}
                                            style={{display: "none"}}
                                        />
                                    )
                                })}
                            </Map>
                            <div className="legend" align="center">
                                <h3>Legend</h3>
                                {this.renderLegend()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ) : (
            <div className="col-md-6 offset-md-3" align="center">
                {this.state.initialMessage}
                <ProgressBar bgcolor={"#00695c"} completed={downloadPercent} inProgressText={"Downloading"} completeText={"Downloading Completed"}/>
            </div>
            )}
        </div>
        );
    }
}
export default GoogleApiWrapper({
    apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
    v: "3.30"
})(MapClusterNBH);