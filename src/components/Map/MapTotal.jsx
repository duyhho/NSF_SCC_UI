import React, { Component } from "react"
import { Map, GoogleApiWrapper, Polygon } from "google-maps-react"
import update from 'immutability-helper'
import axios from 'axios'

import { server } from '../../controllers/Server.js'
import { modal } from '../../utilities/modal.js'

export class MapTotal extends Component {
    constructor(props) {
        super(props);
        this.polygonRef = React.createRef();

        this.state = {
            serverDomain: server.getServerDomain(),
            loadingBlockGroup: false,
            loadingNeighborhood: false,
            loadingCouncilDistrict: false,
            loadingSchoolDistrict: false,
            loadingPoliceDivision: false,
            initialMessage: "Loading the data. Please wait...",
            currentPosition: {lat: 39.0410436302915, lng: -94.5876739197085},
            colorArray: ['#FF8C00', '#FFFF00', '#00BCF2', '#00B294',
                        '#FFB6C1', '#68217A', '#00188F', '#BAD80A', '#E81123', '#009E49' ],
            categoryList: [],
            selectedCategory: "Block Groups",
            blockGroupList: [[]],
            neighborhoodList: [[]],
            councilDistrictList: [[]],
            schoolDistrictList: [[]],
            policeDivisionList: [[]],
        };
    }

    componentDidMount() {
        this.setState({
            loadingBlockGroup: true,
            loadingNeighborhood: true,
            loadingCouncilDistrict: true,
            loadingSchoolDistrict: true,
            loadingPoliceDivision: true,
        })
        this.loadAllDataLists()
    }

    loadAllDataLists() {
        var self = this;

        //Load Block Groups
        axios.get('https://dl.dropboxusercontent.com/s/ujgnx6ynq4cubo4/465BG-Clusters.json?dl=0')
        .then(function(response) {
            const blockGroupData = response.data.slice(1, response.data.length)
            self.setState({
                blockGroupList: blockGroupData,
                loadingBlockGroup: false,
                categoryList: update(self.state.categoryList,
                    {$push: ["Block Groups"]}
                )
            })
        })
        .catch(function(e) {
            self.setState({
                loadingBlockGroup: false
            })
            modal.showInfo("Cannot load the block group data!", "danger", "top", "center");
        })

        //Load Neighborhoods
        axios.get('https://dl.dropboxusercontent.com/s/n9nn5pk2ym7wxcl/246NBH-Clusters.json?dl=0?dl=0')
        .then(function(response) {
            const neighborhoodData = response.data.slice(1, response.data.length)
            self.setState({
                neighborhoodList: neighborhoodData,
                loadingNeighborhood: false,
                categoryList: update(self.state.categoryList,
                    {$push: ["Neighborhoods"]}
                )
            })
        })
        .catch(function(e) {
            self.setState({
                loadingNeighborhood: false
            })
            modal.showInfo("Cannot load the neighborhood data!", "danger", "top", "center");
        })

        //Load Council District
        axios.get('https://dl.dropboxusercontent.com/s/yjd2lxrwvmkc12q/Council%20Districts.geojson?dl=0')
        .then(function(response) {
            self.setState({
                councilDistrictList: response.data.features,
                loadingCouncilDistrict: false,
                categoryList: update(self.state.categoryList,
                    {$push: ["Council Districts"]}
                )
            })
        })
        .catch(function(e) {
            self.setState({
                loadingCouncilDistrict: false
            })
            modal.showInfo("Cannot load the council district data!", "danger", "top", "center");
        })

        //Load School District
        axios.get('https://dl.dropboxusercontent.com/s/67xw4zvp2retyah/School%20Districts.geojson?dl=0')
        .then(function(response) {
            self.setState({
                schoolDistrictList: response.data.features,
                loadingSchoolDistrict: false,
                categoryList: update(self.state.categoryList,
                    {$push: ["School Districts"]}
                )
            })
        })
        .catch(function(e) {
            self.setState({
                loadingSchoolDistrict: false
            })
            modal.showInfo("Cannot load the school district data!", "danger", "top", "center");
        })

        //Load Police Division
        axios.get('https://dl.dropboxusercontent.com/s/nnvcad4r0twpij1/Police%20Divisions.geojson?dl=0')
        .then(function(response) {
            self.setState({
                policeDivisionList: response.data.features,
                loadingPoliceDivision: false,
                categoryList: update(self.state.categoryList,
                    {$push: ["Police Divisions"]}
                )
            })
        })
        .catch(function(e) {
            self.setState({
                loadingPoliceDivision: false
            })
            modal.showInfo("Cannot load the police division data!", "danger", "top", "center");
        })
    }

    setPolygonOptions = (options) => {
        this.polygonRef.current.polygon.setOptions(options);
    };

    handleCategoryChange(e) {
        this.setState({
            selectedCategory: e.target.value
        })
    }

    renderPolygons() {
        var self = this;
        const selectedCategory = this.state.selectedCategory;
        const blockGroupList = this.state.blockGroupList;
        const neighborhoodList = this.state.neighborhoodList;
        const councilDistrictList = this.state.councilDistrictList;
        const schoolDistrictList = this.state.schoolDistrictList;
        const policeDivisionList = this.state.policeDivisionList;

        var returnedData, colorCount = 0;
        if (selectedCategory === "Block Groups") {
            returnedData = Object.keys(blockGroupList[0]).map(item => {
                if (item === "Cluster_Total" || item === 'Cluster_Profiles') {
                    return <div></div>;
                } else {
                    const coords = blockGroupList[0][item]["Boundaries"]
                    var coordArr = []
                    coords.forEach(function(coord) {
                        coordArr.push({
                            lat: coord[0], lng: coord[1]
                        });
                    })
                    return (
                        <Polygon
                            ref={self.polygonRef}
                            paths={coordArr}
                            strokeColor={self.state.colorArray[blockGroupList[0][item]["Cluster by All Factors"] - 1]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={self.state.colorArray[blockGroupList[0][item]["Cluster by All Factors"] - 1]}
                            fillOpacity={0.75}
                        />
                    )
                }
            })
        } else if (selectedCategory === "Neighborhoods") {
            returnedData = Object.keys(neighborhoodList[0]).map(item => {
                if (item === "Cluster_Total" || item === 'Cluster_Profiles') {
                    return <div></div>;
                } else {
                    const coords = neighborhoodList[0][item]["Boundaries"]
                    var coordArr = []
                    coords.forEach(function(coord) {
                        coordArr.push({
                            lat: coord[1], lng: coord[0]
                        });
                    })
                    return (
                        <Polygon
                            ref={self.polygonRef}
                            paths={coordArr}
                            strokeColor={self.state.colorArray[neighborhoodList[0][item]["Cluster by All Factors"] - 1]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={self.state.colorArray[neighborhoodList[0][item]["Cluster by All Factors"] - 1]}
                            fillOpacity={0.75}
                        />
                    )
                }
            })
        } else if (selectedCategory === "Council Districts") {
            colorCount = 0
            returnedData = councilDistrictList.map(district => {
                var subReturnedData = district.geometry.coordinates[0].map(function(area) {
                    var coordArr = []
                    area.forEach(function(coord) {
                        coordArr.push({
                            lat: coord[1], lng: coord[0]
                        });
                    })
                    return (
                        <Polygon
                            ref={self.polygonRef}
                            paths={coordArr}
                            strokeColor={self.state.colorArray[colorCount]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={self.state.colorArray[colorCount]}
                            fillOpacity={0.75}
                        />
                    )
                })

                colorCount += 1
                return subReturnedData
            })
        } else if (selectedCategory === "School Districts") {
            colorCount = 0
            returnedData = schoolDistrictList.map(district => {
                if (district.geometry) {
                    var subReturnedData = district.geometry.coordinates[0].map(function(area) {
                        var coordArr = []
                        area.forEach(function(coord) {
                            coordArr.push({
                                lat: coord[1], lng: coord[0]
                            });
                        })
                        return (
                            <Polygon
                                ref={self.polygonRef}
                                paths={coordArr}
                                strokeColor={self.state.colorArray[colorCount]}
                                strokeOpacity={1}
                                strokeWeight={3}
                                fillColor={self.state.colorArray[colorCount]}
                                fillOpacity={0.75}
                            />
                        )
                    })
                }

                colorCount += 1
                return subReturnedData
            })
        } else if (selectedCategory === "Police Divisions") {
            colorCount = 0
            returnedData = policeDivisionList.map(district => {
                var subReturnedData = district.geometry.coordinates[0].map(function(area) {
                    var coordArr = []
                    area.forEach(function(coord) {
                        coordArr.push({
                            lat: coord[1], lng: coord[0]
                        });
                    })
                    return (
                        <Polygon
                            ref={self.polygonRef}
                            paths={coordArr}
                            strokeColor={self.state.colorArray[colorCount]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={self.state.colorArray[colorCount]}
                            fillOpacity={0.75}
                        />
                    )
                })

                colorCount += 1
                return subReturnedData
            })
        }

        return returnedData
    }

    render() {
        const currentPosition = this.state.currentPosition;

        var finishedLoadingData = false;
        if (this.state.loadingBlockGroup === false && this.state.loadingNeighborhood === false && this.state.loadingCouncilDistrict === false && this.state.loadingSchoolDistrict === false && this.state.loadingPoliceDivision === false) {
            finishedLoadingData = true
        }

        if (!this.props.google) {
            return <div>Loading...</div>;
        }

        return (
        <div className="page-container">
            {finishedLoadingData === true ? (
            <div className="row">
                <div className="col-md-6 map-view-container" style = {{height: "95vh"}}>
                    <div className="map-top-center">
                        <select defaultValue="Block Groups" onChange={this.handleCategoryChange.bind(this)}>
                            {this.state.categoryList.map(function(item){
                                return <option key={item} value={item}>{item}</option>
                            })}
                        </select>
                    </div>
                    <div className="map-container">
                        <Map
                            google={this.props.google}
                            initialCenter={currentPosition}
                            zoom={11}
                            stretViewControl = {false}
                        >
                            {this.renderPolygons()}
                        </Map>
                    </div>
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
})(MapTotal);