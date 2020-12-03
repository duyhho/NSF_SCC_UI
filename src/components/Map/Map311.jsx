import React, { Component } from "react";
import { Map, Marker, GoogleApiWrapper, } from "google-maps-react";

export class Map311 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //Sample data
            coordinatesList: [{lat: 39.0410436302915,lng: -94.5876739197085}, {lat: 39.039860, lng: -94.596710}]
        };
    }
    
    componentDidMount() {
        this.setCoordinates();
    }

    setCoordinates() {
        //Set State for coordinates
    }

    render() {
        const coordinatesList = this.state.coordinatesList;

        if (!this.props.google) {
            return <div>Loading...</div>;
        }
        
        return (
        <div>
            <div className="row">
                <div className="col-md-10 map-311">
                    <div className="map-container">
                        <Map
                            google={this.props.google} 
                            initialCenter={coordinatesList[0]}
                            center={coordinatesList[1]}
                            zoom={14}
                        >
                        
                        {coordinatesList.map((coord) =>
                        <Marker
                            position={coord}
                            name={"311 Location"}
                            icon={{
                                //TODO: Move image to local
                              url: "https://p7.hiclipart.com/preview/1020/199/663/computer-icons-clip-art-green-circle-icon.jpg",
                              anchor: new window.google.maps.Point(64, 64),
                              scaledSize: new window.google.maps.Size(15, 15)
                            }}
                        />
                        )}

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
})(Map311);
