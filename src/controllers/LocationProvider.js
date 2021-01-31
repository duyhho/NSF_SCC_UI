import Geocode from 'react-geocode'

class LocationProvider {
    constructor() {
        this.latLng = {}
        this.zipcode = ""
        this.county = ''
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

                },function (e) {
                    //Your error handling here
                }, {
                    enableHighAccuracy: true
                });
            });
        }
    }

    getCurrentLocation(callback) {
        var self = this;
        Geocode.setApiKey("AIzaSyAAKEUHaLzR2U_-XBdTwPE_VZ39ZPh6hb8")
        var curLocation = this.getGeocode();
        curLocation.then(function(result){
            if (result.lat != null && result.lng != null) {
                console.log(result)
                self.latLng = {lat: result.lat.toFixed(6), lng: result.lng.toFixed(6)}
                Geocode.fromLatLng(result.lat, result.lng).then(
                    response => {
                        console.log(response)
                        const formatted_address = response.results[0].formatted_address
                        response.results[0].address_components.forEach(comp => {
                            if (comp.types[0] === 'postal_code'){
                                self.zipcode = comp.long_name
                            }
                            else if (comp.types[0] === 'administrative_area_level_2'){
                                self.county = comp.long_name
                            }

                        })
                        if (callback) {
                            callback(formatted_address)
                        }
                    },
                )
            }
        })
    }
    getLatLng(){
        return this.latLng
    }
    getZipcode(){
        return this.zipcode
    }
    getCounty() {
        return this.county
    }
}

export let locationProvider = new LocationProvider();