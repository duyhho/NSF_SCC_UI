import axios from 'axios'

class DummyData {
    constructor() {
        this.data = []
    }
    getData(callback){
        axios.get(`https://dl.dropboxusercontent.com/s/ivq1owg373wjctc/dummy311_data.json?dl=0`)
            .then(function(response) {
                // console.log(response.data)
                callback(response.data)
            })
            .catch(function(e) {
                console.log(e)
            })
    }

}

export let dummyData = new DummyData();