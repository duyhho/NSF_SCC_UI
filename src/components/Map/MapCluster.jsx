import React, { Component } from "react"
import { Map, GoogleApiWrapper, Polygon } from "google-maps-react"
import update from 'immutability-helper'
import axios from 'axios'
import Slider from '@material-ui/core/Slider'
import { BarChart, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

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
            colorArray: ['#FF8C00', '#E81123', '#FFFF00', '#00BCF2', '#00B294',
                        '#FFB6C1', '#68217A', '#00188F', '#BAD80A', '#009E49' ],
            colorArray2: ['#ff0000', '#FD706B', '#F8858B', 
                            '#FFFF33','#FFFF66','#FFFFCC', 
                            '#B7FFBF', '#95F985', '#4DED30', '#26D701', 
                            '#70a1d7', '#d0baa8', '#afffdf', '#aa96da', '#fcbad3', '#f25d9c', '#10ddc2'],
            categoryList: [
                {cat: "311 Call Category"},
                {cat: "311 Assigned Department"},
                {cat: "311 Response Time"},
                {cat: "311 Call Frequency"},
                {cat: "Census Socioeconomic Metrics"},
                {cat: "All Factors"}
            ],
            currentCategory: "Cluster by Socioeconomic Metrics",
            defaultCategoryMetadata: 'Socioeconomic Metrics',
            selectedNeighborhood: null,
            chartFilterList: [{cat: "Median income"}, {cat: "Median home value"}, {cat: "Total population"}],
            currentChartCategory: "Total population",
            currentClusterID: null,
            clusterMetadata: null,
            currentChartData: null,
            legendName:'',
            currentClusterProfileContent:null,
            selected: ''
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
        // axios.get('https://dl.dropboxusercontent.com/s/5dyq70p4l5ptkah/230BG-Clusters.json?dl=0')

        axios.get('https://dl.dropboxusercontent.com/s/ujgnx6ynq4cubo4/465BG-Clusters.json?dl=0')
        .then(function(response) {
            for (var i = 2; i <= response.data.length; i++) {
                self.setState({
                    sliderLabels: update(self.state.sliderLabels, {$push: [{
                        value: i,
                        label: i,
                    }]
                    }),
                })
            }
            var chartFilterList = [];
            const allMetrics = response.data[0][self.state.defaultCategoryMetadata]
            allMetrics.forEach(function(item){
                chartFilterList.push({cat: item })
            })
            self.setState({
                clusterMetadata: response.data[0],
                chartFilterList: chartFilterList
            })
            const bgClusterLists = response.data.slice(1,response.data.length)
            bgClusterLists.forEach(function(item) {
                if (item.Cluster_Total === 2) {
                    self.setState({
                        currentCluster: item,
                    })
                }
            })

            self.setState({
                neighborhoodList: bgClusterLists,
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
        self.state.neighborhoodList.forEach(function(item) {
            if (item.Cluster_Total === value) {
                self.setState({
                    currentCluster: item,
                    selectedNeighborhood: null,
                })
            }
        })

        const obj = {
            target: {
                value: self.state.chartFilterList[0].cat //Resets back to first metric
            }
        }
        self.handleChartCategoryChange(obj)
    }

    handleCategoryChange(e) {
        const selectedValue = e.target.value;
        const currentCluster = this.state.currentCluster
        this.setState({
            currentCluster: []
        }, function(){
            // console.log(this.state.currentCluster)
            this.setState({
                currentCluster: currentCluster
            })
        })

        if (selectedValue === "311 Call Category") {
            this.setState({
                currentCategory: "Cluster by Call Category",
                currentChartCategory: this.state.clusterMetadata['Categories'][0]
            })
            this.renderChartList("Cluster by Call Category")
        } else if (selectedValue === "311 Assigned Department") {
            this.setState({
                currentCategory: "Cluster by Department",
                currentChartCategory: this.state.clusterMetadata['Departments'][0]
            })
            this.renderChartList("Cluster by Department")
        } else if (selectedValue === "311 Response Time") {
            this.setState({
                currentCategory: "Cluster by Response Time",
                currentChartCategory: this.state.clusterMetadata['Response Times'][0]
            })
            this.renderChartList("Cluster by Response Time")
        } else if (selectedValue === "311 Call Frequency") {
            this.setState({
                currentCategory: "Cluster by Call Frequency",
                currentChartCategory: this.state.clusterMetadata['Frequency'][0]
            })
            this.renderChartList("Cluster by Call Frequency")
        } else if (selectedValue === "Census Socioeconomic Metrics") {
            this.setState({
                currentCategory: "Cluster by Socioeconomic Metrics",
                currentChartCategory: this.state.clusterMetadata['Socioeconomic Metrics'][0]
            })
            this.renderChartList("Cluster by Socioeconomic Metrics")
        } else if (selectedValue === "All Factors") {
            this.setState({
                currentCategory: "Cluster by All Factors"
            })
            this.renderChartList("Cluster by All Factors")
        }

        this.setState({
            selectedNeighborhood: null
        })
    }

    handleChartCategoryChange(e) {
        const currentCluster = this.state.currentCluster;
        const currentCategory = this.state.currentCategory;
        const clusterProfiles = currentCluster["Cluster_Profiles"];
        const currentClusterID = this.state.currentClusterID;
        const selectedChartCategory = e.target.value
        const colorArray = this.state.colorArray2
        var self = this
        if (!e.target.value.includes('Cluster')){
            var chartData = []
            for (var i = 0; i < clusterProfiles[currentCategory].length; i++) {
                const clusterID = clusterProfiles[currentCategory][i]["Cluster_ID"]
                if (clusterID === currentClusterID){
                    chartData.unshift({
                        id: clusterID,
                        name: clusterID + ' (Current)' ,
                        Mean: clusterProfiles[currentCategory][i][selectedChartCategory].mean,
                    })
                }
                else{
                    chartData.push({
                        id: clusterID,
                        name: clusterID ,
                        Mean: clusterProfiles[currentCategory][i][selectedChartCategory].mean,
                    })
                }
            }
            this.setState({
                currentChartCategory: selectedChartCategory,
                currentChartData: chartData
            })
        }
        else if (e.target.value.includes('Cluster')){
            const selectedCluster = e.target.value

            clusterProfiles[currentCategory].forEach(function(profile) {        
                if (selectedCluster.includes(profile['Cluster_ID'])){
                    var tempDict = {}
                    Object.keys(profile).forEach(function(key) {
                        if (key !== 'Cluster_ID'){
                            tempDict[key] = profile[key].mean
                        }
                    })
                    if (!currentCategory.includes('Socioeconomic')){
                        const sortedDict = self.sortObject(tempDict)
                        var chartData = (
                            <div className="col-md-12" align="left" style = {{fontSize: "130%"}}>
                                <br />
                                <div className="row bgrow">
                                    <BarChart
                                        width={700}
                                        height={300}
                                        data={sortedDict}
                                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                        maxBarSize={70}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            label={{value: currentCategory, position: "insideBottom", offset: -5}}
                                            style={{
                                                fontSize: '9px',
                                            }}
                                            interval = {0}
                                        />
                                        <YAxis
                                            label={{value: 'Frequency', angle: -90, position: "insideLeft", dy: 40, offset: -10}}
                                        />
                                        <Tooltip />
                                        <Bar dataKey='value' fill="#8884D8">
                                            {
                                                colorArray.map(function(color, index) {
                                                    return <Cell key={`cell-${index}`} fill={color} />;
                                                })
                                            }
                                        </Bar>
                                    </BarChart>
                                </div>
                            </div>
                        )
                        self.setState({
                            currentClusterProfileContent: chartData,
                            selected: selectedCluster
                        })
                    }
                    else {
                        var content = Object.keys(tempDict).map(function(key) {
                            return <div className="row bgrow">
                                        <div className="col-md-9">
                                            <b>{key}</b>
                                        </div>
                                        <div className="col-md-3">
                                            {Math.round(tempDict[key]).toLocaleString('en')}
                                        </div>
                                    </div>
                        })
                        self.setState({
                            currentClusterProfileContent: content,
                            selected: selectedCluster
                        })
                    }
                }      
            })
        }
    }

    renderChartList(category) {
        var chartFilterList = [];

        if (category === "Cluster by Socioeconomic Metrics") {
            const allMetrics = this.state.clusterMetadata['Socioeconomic Metrics']
            allMetrics.forEach(function(item){
                chartFilterList.push({cat: item })
            })
        } else if (category === "Cluster by Department") {
            const allResponseTimes = this.state.clusterMetadata['Departments']
            allResponseTimes.forEach(function(item){
                chartFilterList.push({cat: item })
            })
        } else if (category === "Cluster by Response Time") {
            const allResponseTimes = this.state.clusterMetadata['Response Times']
            allResponseTimes.forEach(function(item){
                chartFilterList.push({cat: item })
            })
        } else if (category === "Cluster by Call Category") {
            const allCats = this.state.clusterMetadata['Categories']
            allCats.forEach(function(item){
                chartFilterList.push({cat: item })
            })
        } else if (category === "Cluster by Call Frequency") {
            const allFreqs = this.state.clusterMetadata['Frequency']
            allFreqs.forEach(function(item){
                chartFilterList.push({cat: item })
            })
        } else if (category === "Cluster by All Factors") {

        }

        this.setState({
            chartFilterList: chartFilterList
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
        const currentCategory = this.state.currentCategory;
        const clusterProfiles = currentCluster["Cluster_Profiles"];
        var bgClusterID = null;
        var chartData = [];
        Object.keys(currentCluster).forEach(bg => {
            if (bg === "Cluster_Total" || bg === 'Cluster_Profiles') {
                //SKIP
            } else {
                var yLabel = 'Cluster Mean Value'
                if (currentCluster[bg]["BLOCKGROUP_ID"] === props.nbhId) {
                    self.setState({
                        selectedNeighborhood: currentCluster[bg]
                    });

                    if (currentCategory === "Cluster by Socioeconomic Metrics") {

                        bgClusterID = currentCluster[bg]['Cluster by Socioeconomic Metrics'] //Where this BG belongs to
                    } else if (currentCategory === "Cluster by Response Time") {
                        bgClusterID = currentCluster[bg]['Cluster by Response Time'] //Where this BG belongs to
                        yLabel = 'Cluster Mean (% of Cases)'
                    }
                    else if (currentCategory === "Cluster by Department") {
                        bgClusterID = currentCluster[bg]['Cluster by Department'] //Where this BG belongs to
                        yLabel = 'Cluster Mean (% of Total Depts)'

                    } else if (currentCategory === "Cluster by Call Category") {
                        bgClusterID = currentCluster[bg]['Cluster by Call Category'] //Where this BG belongs to
                        yLabel = 'Cluster Mean (% of All Categories)'
                    } else if (currentCategory === "Cluster by Call Frequency") {
                        bgClusterID = currentCluster[bg]['Cluster by Call Frequency'] //Where this BG belongs to
                        yLabel = 'Cluster Mean (% of Total Calls)'
                    } else if (currentCategory === "Cluster by All Factors") {
                        bgClusterID = currentCluster[bg]['Cluster by All Factors'] //Where this BG belongs to
                    }

                    for (var i = 0; i < clusterProfiles[currentCategory].length; i++) {
                        const clusterID = clusterProfiles[currentCategory][i]["Cluster_ID"]
                        if (bgClusterID === clusterID){
                            chartData.unshift({
                                id: clusterID,
                                name: clusterID + ' (Current)' ,
                                Mean: clusterProfiles[currentCategory][i][self.state.currentChartCategory].mean,
                            })
                        }
                        else {
                            chartData.push({
                                id: clusterID,
                                name: clusterID ,
                                Mean: clusterProfiles[currentCategory][i][self.state.currentChartCategory].mean,
                            })
                        }
                    }

                    self.setState({
                        legendName: yLabel,
                        currentChartData: chartData,
                        currentClusterID: bgClusterID,
                        selected: 'Cluster ' + bgClusterID + " (Current)"
                    })
                    self.handleChartCategoryChange({
                        target: {
                            value: 'Cluster ' + bgClusterID
                        }
                    })
                }
            }
        })
    }

    sortObject(obj) {
        var items = Object.keys(obj).map(function(key) {
            return [key, obj[key]];
        });
        items.sort(function(first, second) {
            return second[1] - first[1];
        });
        const top10items = items.slice(0,10);
        var finalList = []
        top10items.forEach(function(item) {
            var name = (item[0].length<=10) ? item[0] : item[0].substring(0,7) + '...';
            finalList.push({
                name: name,
                value: item[1]
            })
        })

        return(finalList)
    }

    downloadData() {
        var link = document.createElement('a');
        link.href = "https://dl.dropboxusercontent.com/s/2iyd4imgq3g8g9t/bg465_clusters.zip?dl=0";
        link.download = "BG465 Clusters";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        modal.showInfo("The file will be downloaded shortly!", "success", "top", "center");
    }

    render() {
        const loadingData = this.state.loadingData;
        const currentCluster = this.state.currentCluster;
        const categoryList = this.state.categoryList;
        const currentColorArray = this.state.colorArray.slice(0, currentCluster['Cluster_Total']);
        const selectedNeighborhood = this.state.selectedNeighborhood;
        const currentClusterID = this.state.currentClusterID;
        var currentChartData = [];
        const clusterProfiles = currentCluster["Cluster_Profiles"];
        if (selectedNeighborhood !== null && currentChartData != null) {
            currentChartData = this.state.currentChartData
        }

        const currentCategory = this.state.currentCategory;
        const clusterMetadata = this.state.clusterMetadata
        const bgColorArray = this.state.colorArray2
        var bgProfileContent = '';
        var clusterProfileContent = this.state.currentClusterProfileContent;
        if (selectedNeighborhood != null ){
            if (currentCategory.includes('Category')){
                const allCats = clusterMetadata['Categories']
                var catFreqs = {};
                allCats.forEach(function(cat){
                    catFreqs[cat] = selectedNeighborhood[cat]
                })
                const sortedCatFreqs = this.sortObject(catFreqs)
                bgProfileContent = (
                <div className="col-md-12" align="left" style = {{fontSize: "130%"}}>
                    <div align="center" style={{fontWeight: 'bold'}}>CURRENT SELECTED BLOCKGROUP PROFILE (CATEGORY)</div>
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
                        <BarChart
                            width={700}
                            height={300}
                            data={sortedCatFreqs}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                            maxBarSize={70}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                label={{value: "Category", position: "insideBottom", offset: -5}}
                                style={{
                                    fontSize: '9px',
                                }}
                                interval = {0}
                            />
                            <YAxis
                                label={{value: 'Frequency', angle: -90, position: "insideLeft", dy: this.state.legendName.length+55, offset: -10}}
                            />
                            <Tooltip />
                            <Bar dataKey='value' fill="#8884D8">
                                {
                                    bgColorArray.map(function(color, index) {
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </div>
                </div>
                )
            }
            else if (currentCategory.includes('Department')){
                const allDepts = clusterMetadata['Departments']
                var deptFreqs = {};

                allDepts.forEach(function(item){
                    deptFreqs[item] = selectedNeighborhood[item]
                })

                const sortedDeptFreqs = this.sortObject(deptFreqs)
                // Create a new array with only the first 5 items
                bgProfileContent = (
                <div className="col-md-12" align="left" style = {{fontSize: "130%"}}>
                    <div align="center" style={{fontWeight: 'bold'}}>CURRENT SELECTED BLOCKGROUP PROFILE (DEPARTMENT)</div>
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
                        <BarChart
                            width={700}
                            height={300}
                            data={sortedDeptFreqs}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                            maxBarSize={70}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                label={{value: "Department", position: "insideBottom", offset: -5}}
                                style={{
                                    fontSize: '9px',
                                }}
                                interval = {0}
                            />
                            <YAxis
                                label={{value: 'Frequency', angle: -90, position: "insideLeft", dy: this.state.legendName.length+55, offset: -10}}
                            />
                            <Tooltip />
                            <Bar dataKey='value' fill="#8884D8">
                                {
                                    bgColorArray.map(function(color, index) {
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </div>
                </div>
                )
            }
            else if (currentCategory.includes('Response')){
                const allResponseTimes = clusterMetadata['Response Times']
                var responseList = []
                allResponseTimes.forEach(function(item){
                    responseList.push({
                        name: item,
                        value: selectedNeighborhood[item]
                    })
                })

                bgProfileContent = (
                <div className="col-md-12" align="left" style = {{fontSize: "130%"}}>
                    <div align="center" style={{fontWeight: 'bold'}}>CURRENT SELECTED BLOCKGROUP PROFILE (RESPONSE TIME)</div>
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
                        <BarChart
                            width={700}
                            height={300}
                            data={responseList}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                            maxBarSize={70}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                label={{value: "Time Window", position: "insideBottom", offset: -5}}
                                style={{
                                    fontSize: '9px',
                                }}
                                interval = {0}
                            />
                            <YAxis
                                label={{value: 'Frequency', angle: -90, position: "insideLeft", dy: this.state.legendName.length+55, offset: -10}}
                            />
                            <Tooltip />
                            <Bar dataKey='value' fill="#8884D8">
                                {
                                    bgColorArray.map(function(color, index) {
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </div>
                </div>
                )
            }
            else if (currentCategory.includes('Frequency')){
                const freq = [{
                    name: selectedNeighborhood["BLOCKGROUP_ID"],
                    value: selectedNeighborhood['Frequency']
                }]
                bgProfileContent = (
                <div className="col-md-12" align="left" style = {{fontSize: "130%"}}>
                    <div align="center" style={{fontWeight: 'bold'}}>CURRENT SELECTED BLOCKGROUP PROFILE (FREQUENCY)</div>
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
                        <BarChart
                            width={700}
                            height={300}
                            data={freq}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                            maxBarSize={70}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                label={{value: 'BLOCKGROUP ID', position: "insideBottom", offset: -5}}
                                interval = {0}
                            />
                            <YAxis
                                label={{value: 'Frequency', angle: -90, position: "insideLeft", dy: this.state.legendName.length+55, offset: -10}}
                            />
                            <Tooltip />
                            <Bar dataKey='value' fill="#8884D8">
                                {
                                    bgColorArray.map(function(color, index) {
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </div>
                </div>
                )
            }
            else if (currentCategory.includes('Socioeconomic')){
                bgProfileContent = (
                <div className="col-md-12" align="left" style = {{fontSize: "120%"}}>
                    <div align="center" style={{fontWeight: 'bold'}}>CURRENT SELECTED BLOCKGROUP PROFILE (SOCIOECONOMIC)</div>
                    <br />
                    <div className="row bgrow">
                        <div className="col-md-9">
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
                        <div className="col-md-9 sub-point">
                            <b>&emsp;White Alone:</b>
                        </div>
                        <div className="col-md-3 sub-point">
                            {selectedNeighborhood["White alone"]}
                        </div>
                    </div>
                    <div className="row bgrow">
                        <div className="col-md-9 sub-point">
                            <b>&emsp;Black or African American Alone:</b>
                        </div>
                        <div className="col-md-3 sub-point">
                            {selectedNeighborhood["Black or African American alone"]}
                        </div>
                    </div>
                    <div className="row bgrow">
                        <div className="col-md-9 sub-point">
                            <b>&emsp;Hispanic or Latino Alone:</b>
                        </div>
                        <div className="col-md-3 sub-point">
                            {selectedNeighborhood["Hispanic or Latino"]}
                        </div>
                    </div>
                    <div className="row bgrow">
                        <div className="col-md-9 sub-point">
                            <b>&emsp;Asian Alone:</b>
                        </div>
                        <div className="col-md-3 sub-point">
                            {selectedNeighborhood["Asian alone"]}
                        </div>
                    </div>
                    <div className="row bgrow">
                        <div className="col-md-9 sub-point">
                            <b>&emsp;Total population with a Bachelor's degree or higher (age 25+):</b>
                        </div>
                        <div className="col-md-3 sub-point">
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
                )
            }
            else if (currentCategory.includes('All')){
                bgProfileContent = (<div>All Factors</div>)
            }
        }

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
                                if (bg === "Cluster_Total" || bg === 'Cluster_Profiles') {
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
                    <div align="center" className = "select-bg">
                        <span>Cluster By:&nbsp;&nbsp;</span>
                        <select defaultValue="Census Socioeconomic Metrics" onChange={this.handleCategoryChange.bind(this)}>
                        {
                        categoryList.map(function(item) {
                            return <option key={item.cat} value={item.cat}>{item.cat}</option>
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
                    {selectedNeighborhood === null && (
                    <div>Click on a neighborhood on the map to view more information!</div>
                    )}
                    {selectedNeighborhood !== null && (
                    <div>
                        {bgProfileContent}
                    </div>
                    )}
                    {selectedNeighborhood !== null && (
                    <div className="col-md-12">
                        <hr />
                        <div align="center" style={{fontWeight: 'bold', fontSize: "130%"}}>CLUSTER PROFILE</div>
                        <div align="center" className = "select-bg">
                            <span>View Details From:&nbsp;&nbsp;</span>
                            <select onChange={this.handleChartCategoryChange.bind(this)} value = {this.state.selected}>
                            {
                            clusterProfiles[currentCategory].map(function(item) {
                                if (item['Cluster_ID'] === currentClusterID){
                                    return <option key={'Cluster ' + item['Cluster_ID'] + " (Current)"} value={'Cluster ' + item['Cluster_ID'] }>Cluster {item['Cluster_ID']} (Current)</option>
                                
                                }
                                return <option key={'Cluster ' + item['Cluster_ID']} value={'Cluster ' + item['Cluster_ID'] }>Cluster {item['Cluster_ID']}</option>
                            })
                            }
                            </select>
                        </div>
                        <div align="left" style = {{fontSize: "120%"}}>
                            {clusterProfileContent}
                        </div>
                        
                        <div align="center" className = "select-bg">
                            <span>Compare Clusters by:&nbsp;&nbsp;</span>
                            <select onChange={this.handleChartCategoryChange.bind(this)}>
                            {
                            this.state.chartFilterList.map(function(item) {
                                return <option key={item.cat} value={item.cat}>{item.cat}</option>
                            })
                            }
                            </select>
                        </div>
                        <br />
                        <BarChart
                            width={700}
                            height={300}
                            data={currentChartData}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                            maxBarSize={70}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                label={{value: "Cluster #", position: "insideBottom", offset: -5}}
                            />
                            <YAxis
                                label={{value: this.state.legendName, angle: -90, position: "insideLeft", dy: this.state.legendName.length+55, offset: -10}}
                            />
                            <Tooltip />
                            <Bar dataKey='Mean' fill="#8884D8">
                                {
                                    (currentChartData !== null) && currentChartData.map(function(cluster, index) {
                                        const color = currentColorArray[cluster['id']-1] // off by 1
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })
                                }
                            </Bar>
                        </BarChart>
                        <br />
                        <button onClick={this.downloadData.bind(this)} className="btn btn-primary">Download Data (Raw)</button>
                        <br />
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