import React, { Component } from "react"
import { Map, GoogleApiWrapper, Polygon } from "google-maps-react"
import axios from 'axios'
import randomColor from 'randomcolor'

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
            categoryList: ['Council Districts', 'Police Districts', 'Neighborhoods', 'Block Groups', 'School Districts'],
            selectedCategory: "Council Districts",
            blockGroupList: [[]],
            neighborhoodList: [[]],
            councilDistrictList: [[]],
            schoolDistrictList: [[]],
            policeDivisionList: [[]],
            tempColor: '#FFFF00'
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
            const neighborhoodData = response.data.slice(2, response.data.length)
            self.setState({
                neighborhoodList: neighborhoodData,
                loadingNeighborhood: false,
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
            })
        })
        .catch(function(e) {
            self.setState({
                loadingSchoolDistrict: false
            })
            modal.showInfo("Cannot load the school district data!", "danger", "top", "center");
        })

        //Load Police District
        axios.get('https://dl.dropboxusercontent.com/s/nnvcad4r0twpij1/Police%20Divisions.geojson?dl=0')
        .then(function(response) {
            self.setState({
                policeDivisionList: response.data.features,
                loadingPoliceDivision: false,
            })
        })
        .catch(function(e) {
            self.setState({
                loadingPoliceDivision: false
            })
            modal.showInfo("Cannot load the police district data!", "danger", "top", "center");
        })
    }

    handleCategoryChange(e) {
        this.setState({
            selectedCategory: e.target.value
        })
    }

    handleClick(props,polygon,e) {

    };

    handleMouseOver(props,polygon,e) {
        this.setState({
            tempColor: props.fillColor
        })
        polygon.setOptions({ fillColor: "#1E90FF", strokeColor: "#1E90FF"});
    };

    handleMouseOut(props,polygon,e) {
        polygon.setOptions({ fillColor: this.state.tempColor, strokeColor: this.state.tempColor});
    };

    renderPolygons() {
        var self = this;
        const selectedCategory = this.state.selectedCategory;
        const blockGroupList = this.state.blockGroupList;
        const neighborhoodList = this.state.neighborhoodList;
        const councilDistrictList = this.state.councilDistrictList;
        const schoolDistrictList = this.state.schoolDistrictList;
        const policeDivisionList = this.state.policeDivisionList;

        var returnedData, randomColorArr, colorCount = 0, colorIndex = -1;
        if (selectedCategory === "Block Groups") {
            randomColorArr = randomColor({
                count: Object.keys(blockGroupList[0]).length,
            })
            colorIndex = -1

            //This function is to check how many times a value appears in this color array
            randomColorArr.forEach(item => {
                var count = 0
                randomColorArr.forEach((color) => (color === item && count++))
                console.log(count)
            })

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
                    colorIndex += 1

                    return (
                        <Polygon
                            ref={self.polygonRef}
                            paths={coordArr}
                            strokeColor={randomColorArr[colorIndex]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={randomColorArr[colorIndex]}
                            fillOpacity={0.75}
                        />
                    )
                }
            })
        } else if (selectedCategory === "Neighborhoods") {
            randomColorArr = randomColor({
                count: Object.keys(neighborhoodList[0]).length,
            })
            colorIndex = -1

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
                    colorIndex += 1

                    return (
                        <Polygon
                            ref={self.polygonRef}
                            paths={coordArr}
                            strokeColor={randomColorArr[colorIndex]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={randomColorArr[colorIndex]}
                            fillOpacity={0.75}
                        />
                    )
                }
            })
        } else if (selectedCategory === "Council Districts") {
            colorCount = 0
            returnedData = councilDistrictList.map(district => {
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
                                item = {district.properties.district}
                                strokeColor={self.state.colorArray[colorCount]}
                                strokeOpacity={1}
                                strokeWeight={3}
                                fillColor={self.state.colorArray[colorCount]}
                                fillOpacity={0.75}
                                onClick = {self.handleClick.bind(self)}
                                onMouseover = {self.handleMouseOver.bind(self)}
                                onMouseout = {self.handleMouseOut.bind(self)}
                            />
                        )
                    })
                    colorCount += 1
                }
                return subReturnedData
            })
        } else if (selectedCategory === "School Districts") {
            colorCount = 0
            returnedData = schoolDistrictList.map(district => {
                if (district.geometry && (district.properties['district_name'].includes('KANSAS CITY MISSOURI') || district.properties['district_name'].includes('NORTH KANSAS CITY'))) {
                    var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
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
                                item = {district.properties['district_name']}
                                strokeColor={randomColor}
                                strokeOpacity={1}
                                strokeWeight={3}
                                fillColor={randomColor}
                                fillOpacity={0.75}
                                onClick = {self.handleClick.bind(self)}
                                onMouseover = {self.handleMouseOver.bind(self)}
                                onMouseout = {self.handleMouseOut.bind(self)}
                            />
                        )
                    })
                    colorCount += 1
                }
                return subReturnedData
            })
        } else if (selectedCategory === "Police Districts") {
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
                            item = {district.properties.divisionname}
                            strokeColor={self.state.colorArray[colorCount]}
                            strokeOpacity={1}
                            strokeWeight={3}
                            fillColor={self.state.colorArray[colorCount]}
                            fillOpacity={0.75}
                            onClick = {self.handleClick.bind(self)}
                            onMouseover = {self.handleMouseOver.bind(self)}
                            onMouseout = {self.handleMouseOut.bind(self)}
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

        if (!this.props.google) {
            return <div>Loading...</div>;
        }

        return (
        <div className="page-container">
            <div className="row">
                <div className="col-md-6 map-view-container" style = {{height: "95vh"}}>
                    <div className="map-top-center">
                        <select defaultValue="Council Districts" onChange={this.handleCategoryChange.bind(this)}>
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
        </div>
        );
    }
}
export default GoogleApiWrapper({
    apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
    v: "3.30"
})(MapTotal);