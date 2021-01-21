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

    getCurrentLocation(callback) {
        Geocode.setApiKey("AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8")
        var curLocation = this.getGeocode();
        curLocation.then(function(result){
            if (result.lat != null && result.lng != null) {
                Geocode.fromLatLng(result.lat, result.lng).then(
                    response => {
                        if (callback) {
                            callback(response.results[0].formatted_address)
                        }
                    },
                )
            }
        })
    }
}

export let locationProvider = new LocationProvider();