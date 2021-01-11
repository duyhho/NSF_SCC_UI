import React, { Component } from "react";
import ImageGallery from 'react-image-gallery';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polygon } from "google-maps-react";
import update from 'immutability-helper';
import axios from 'axios'
import $ from 'jquery'

import { modal } from '../../utilities/modal.js'
import { server } from '../../controllers/Server.js'

import ProgressBar from '../ProgressBar/ProgressBar.jsx'

export class MapStreetView extends Component {
  constructor(props) {
    super(props);
    this.polygonRef = React.createRef();
    // Purpose of ".bind(this)" is to be able to use 'this' within the function
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.addMarker = this.addMarker.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onVrViewLoad = this.onVrViewLoad.bind(this);
    this.onPolygonMouseOver = this.onPolygonMouseOver.bind(this);
    this.onPolygonMouseOut = this.onPolygonMouseOut.bind(this);


    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      fields: {
        start_location: {lat: 39.0410436302915, lng: -94.5876739197085},
        end_location: {lat: 39.0383456697085, lng: -94.5903718802915}
      },
      rectangle_coords: [],
      infoWindowContent: (
        <div></div>
      ),
      imageList: [],
      dataLoading: false,
      serverError: true,
      category: "utility",
      editStart: false,
      editEnd: false,
      firstLoad: true,
      firstImageReturned: false,
      returnedPercent: 0,
      serverDomain: server.getServerDomain(),
      // vrViewUrl: "https://f0c06ecb4442.ngrok.io",
      vrView: null,
      neighborhoodList: [],
      neighborhoodInfo: [],


    };
  }

  //Always have this function on any .jsx file, even though it's empty
  componentDidMount() {
    var self = this;
    var curLocation = this.getcurrentLocation();

    if (this.state.firstLoad === true) {
      curLocation.then(function(result){
        if (result.lat != null && result.lng != null) {
          self.setState({
            fields: update(self.state.fields, {
              start_location: {$set: {
                lat: result.lat,
                lng: result.lng
              }},
              end_location: {$set: {
                lat: result.lat,
                lng: result.lng
              }}
            })
          })
        }
      })
    }
    // this.onVrViewLoad()
    this.loadNeighborhoodList()
    this.loadNeighborhoodInfo()

    this.setState({
      firstLoad: false,
    })
  }
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

  onVrViewLoad() {
    const vrViewUrl = this.state.vrViewUrl;

    // Selector '#vrview' finds element with id 'vrview'.
    this.setState({
      vrView: new window.VRView.Player('#vrview', {
        image: vrViewUrl + '/static/temp-big.jpg',
        is_stereo: false,
      })
    })
  }

  onMarkerClick(props, marker, e) {
    if (props.name === "Start Location") {
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true,
        infoWindowContent: (<div>
          <h2>Start Location</h2>
        <b>{"Coordinates: " + this.state.fields.start_location.lat.toString() + ', ' + this.state.fields.start_location.lng.toString()}</b>
           </div>)
      });
    }
    else if (props.name === "Stop Location") {
      var lat =  props.position.lat.toFixed(4).toString()
      var lng =  props.position.lng.toFixed(4).toString()

      // var lat = props.position.lat[0]['d'].toString()
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true,
        infoWindowContent: (<div>
          <h2>Stop Location</h2>
          <b>{"Coordinates: " + lat + ', ' + lng}</b>

           </div>)
      });
    }
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

  addMarker(location, map){
    const startLocation = this.state.fields.start_location;
    const endLocation = this.state.fields.end_location;
    const editStart = this.state.editStart;
    const editEnd = this.state.editEnd;

    if (editStart === true && editEnd === false) {
      this.setState(prev => ({
        fields: {
          start_location: {lat: location.lat(), lng: location.lng()},
          end_location: endLocation
        },
        rectangle_coords: [
          endLocation,
          {lat: endLocation.lat, lng: location.lng()},
          {lat: location.lat(), lng: location.lng()},
          {lat: location.lat(), lng: endLocation.lng}
        ]
      }));
    } else {
      this.setState(prev => ({
        fields: {
          start_location: startLocation,
          end_location:{lat: location.lat(), lng: location.lng()}
        },
        rectangle_coords: [
          startLocation,
          {lat: startLocation.lat, lng: location.lng()},
          {lat: location.lat(), lng: location.lng()},
          {lat: location.lat(), lng: startLocation.lng}
        ]
      }));
    }

    map.panTo(location);

    this.setPolygonOptions({
      // fillColor: "green",
      paths:[
      this.state.rectangle_coords
    ]});
  };

  onMapClicked(mapProps, map, clickEvent) {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      })
    }

    this.addMarker(clickEvent.latLng, map)
    $("#neighborhood_select").val("Custom")
  };

  handleClick() {
    console.log('in handle click()')
  }

  setPolygonOptions = (options) => {
    this.polygonRef.current.polygon.setOptions(options);
  };

  sendLocation = () => {
    this.setState({
      imageList: [],
      dataLoading: true,
      returnedPercent: 0,
    })

    var self = this;
    const start_coord = JSON.stringify(this.state.fields.start_location)
    const end_coord = JSON.stringify(this.state.fields.end_location)
    const category = this.state.category;
    const serverDomain = this.state.serverDomain;

    var eventSource = new EventSource(serverDomain + "/api/GSV/stream?category=" + category +
                                    '&start_coord=' + start_coord + '&end_coord=' + end_coord);
    eventSource.onmessage = e => {
      if (self.state.firstImageReturned === false) {
        modal.showInfo("Images are being streamed! See the progress bar below!", "success", "top", "center");
      }

      if (e.data === 'END-OF-STREAM') {
        eventSource.close()
        self.setState({
          serverError: false,
          dataLoading: false
        })
      } else {
        var jsonData = JSON.parse(e.data)
        self.setState({
          imageList: update(self.state.imageList, {$push: [{
            original: 'data:image/jpg;base64,' + jsonData.image,
            thumbnail: 'data:image/jpg;base64,' + jsonData.image,
          }]
          }),
          returnedPercent: Math.round(jsonData.progress)
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

  handleEditStart() {
    const editStart = this.state.editStart;

    if (editStart === false) {
      this.setState({
        editStart: true
      })
    } else {
      this.setState({
        editStart: false
      })
    }
  }

  handleEditEnd() {
    const editEnd = this.state.editEnd;

    if (editEnd === false) {
      this.setState({
        editEnd: true
      })
    } else {
      this.setState({
        editEnd: false
      })
    }
  }

  handleNeighborhoodChange(e) {
    var self = this;
    const selectedValue = e.target.value;
    const neighborhoodList = this.state.neighborhoodList;

    if (selectedValue !== "Custom") {
      neighborhoodList.forEach(function(item) {
        if (item.name === selectedValue) {
          self.setState(prev => ({
            fields: {
              start_location: item.start,
              end_location: item.end
            },
            rectangle_coords: [
              item.start,
              {lat: item.start.lat, lng: item.end.lng},
              item.end,
              {lat: item.end.lat, lng: item.start.lng}
            ]
          }));
        }
      })
    }
  }
  // autoCenterMap = ({ google }, map) => {
  //   console.log(this.props.google.maps)
  //   console.log(map)

  //   this.loadGeoJson(map);
  // }
  // loadGeoJson = async (map) => {
  //   // const geojsonRoutes = await this.getRoutes(feed_code);
  //   // const geojsonEnvelope = await this.getEnvelope(feed_code)
  //   // map.data.addGeoJson(geojsonEnvelope);
  //   if (this.state.neighborhoodInfo !== null){
  //     console.log(this.state.neighborhoodInfo)
  //     map.data.addGeoJson(this.state.neighborhoodInfo); // # load geojson layer
  //   }
// }
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
  render() {
    const start_location = this.state.fields.start_location;
    const end_location = this.state.fields.end_location;
    const rectangle = this.state.rectangle_coords;
    const imageList = this.state.imageList;
    const dataLoading = this.state.dataLoading;
    const serverError = this.state.serverError;
    const editStart = this.state.editStart;
    const editEnd = this.state.editEnd;
    const firstImageReturned = this.state.firstImageReturned;
    const returnedPercent = this.state.returnedPercent;
    const neighborhoodList = this.state.neighborhoodList;
    const neighborhoodInfo = this.state.neighborhoodInfo;

    // console.log(this.state.serverDomain)

    var predictButtonText = ""
    if (dataLoading === false) {
      predictButtonText = "Predict"
    } else {
      predictButtonText = "Loading..."
    }

    var helpText = 'No predictions. Click "Predict" button on the map to start.'

    var startButtonText = ""
    if (editStart === true) {
      startButtonText = "Cancel Edit..."
    } else {
      startButtonText = "Edit Start Pointer"
    }

    var endButtonText = ""
    if (editEnd === true) {
      endButtonText = "Cancel Edit..."
    } else {
      endButtonText = "Edit End Pointer"
    }

    //Start
    if (!this.props.google) {
      return <div>Loading...</div>;
    }

    return (
      <div className="page-container">
        <div className="edit-start-button">
          <button className="btn btn-primary" onClick={this.handleEditStart.bind(this)} disabled={editEnd}>{startButtonText}</button>
        </div>
        <div className="edit-end-button">
          <button className="btn btn-primary" onClick={this.handleEditEnd.bind(this)} disabled={editStart}>{endButtonText}</button>
        </div>
        <div className="neighborhood-select">
          <select id="neighborhood_select" defaultValue="Custom" onChange={this.handleNeighborhoodChange.bind(this)} disabled={dataLoading}>
            <option value={"Custom"}>Custom</option>
            {
              neighborhoodList.map(function(item) {
                return <option value={item.name}>{item.name}</option>
              })
            }
          </select>
        </div>

        <div className="row">
          <div className="col-md-6 map-view-container" style = {{height: "95vh"}}>
            <div className="map-top-center">
              <button onClick={this.sendLocation} disabled={dataLoading} className="btn btn-primary">{predictButtonText}</button>
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
                initialCenter={start_location}
                center={end_location}
                zoom={14}
                onClick={this.onMapClicked}
              >
                {neighborhoodInfo.forEach(region => {
                    const coords = region.geometry.coordinates[0][0]
                    let coord_arr = []
                    coords.forEach(coord => {
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
                <Marker
                  label = {{text: 'start',
                            fontFamily: "Arial",
                            fontSize: "12px",}}
                  onClick={this.onMarkerClick}
                  position={start_location}
                  name={"Start Location"}
                />
                <Marker
                  label = {{text: 'end',
                  fontFamily: "Arial",
                  fontSize: "12px",}}
                  onClick={this.onMarkerClick}
                  position={end_location}
                  name={"Stop Location"}
                />
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
        {/* <div className="row">
          <div className="col-md-6">
            <div id="vrview"></div>
          </div>
        </div> */}
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: "AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8",
  v: "3.30"
})(MapStreetView);
