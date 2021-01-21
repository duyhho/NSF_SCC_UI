import Geocode from 'react-geocode'

class LocationProvider {
    constructor() {
        this.currentLocation = "default";
    }

    getGeocode() {
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
    setCurrentLocation(callback) {

        Geocode.setApiKey("AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8")
        var self = this
        var curLocation = this.getGeocode();
        curLocation.then(function(result){
            if (result.lat != null && result.lng != null) {
                 Geocode.fromLatLng(result.lat, result.lng).then(
                    response => {
                        self.currentLocation = response.results[0].formatted_address
                        callback(response.results[0].formatted_address)
                    },
                )
            }

        })
    }
    getCurrentLocation(){
        console.log('in getCurrentLocation()')
        return this.currentLocation
    }

}

export let locationProvider = new LocationProvider();