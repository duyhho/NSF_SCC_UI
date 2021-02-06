import "firebase/firestore";
import {
  FirebaseAppProvider,
  useFirestore,
  useFirestoreCollectionData,
} from "reactfire";
import { useState, useEffect } from 'react'
import { dummyData } from './dummyData.js'

const firebaseConfig = {
  apiKey: "AIzaSyAuqrJSVK3_RyZkIPGt2nqt2XMM9XvLad8",
  authDomain: "nsfscc-umkc.firebaseapp.com",
  projectId: "nsfscc-umkc",
  storageBucket: "nsfscc-umkc.appspot.com",
  messagingSenderId: "1051748532808",
  appId: "1:1051748532808:web:329f4b10628ab679a38e7d",
  measurementId: "G-3NK4G5XJZM"
};
export const CaseData = (status) => {
    // console.log(status)
    // easily access the Firestore library
    var [cols, updateCols ] = useState([]);
    var [dummy, updateDummy] = useState([])
    const caseCollection = useFirestore().collection("cases")
    const caseData = useFirestoreCollectionData(caseCollection).data
    // console.log(caseData)
    useEffect(() => {
        dummyData.getData(function(response){
            // console.log(response)
            updateDummy(response)
            updateCols(Object.keys(response[0]))
        });
        }, []);

    // allData = caseData.concat(dummy)
    // console.log(allData)
    return (
        <FirebaseAppProvider firebaseConfig={firebaseConfig}>
            <div className = 'row data-table'>
                <div className="col-md-6">
                    <table class="ui sortable celled table " >
                        <thead>
                            <tr>
                                {cols.map(col => {
                                    // console.log(col)
                                    return  <th>{col}</th>
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {
                                (caseData !== undefined) && caseData.map(row => {
                                    // console.log(row['CASE ID'].toString())

                                    if (row['CASE ID'].toString().includes('2021')){
                                        const newRow = {
                                            "CASE ID": row['CASE ID'],
                                            "SOURCE": row['SOURCE'],
                                            "DEPARTMENT": row['DEPARTMENT'],
                                            "WORK GROUP": row['WORK GROUP'],
                                            "REQUEST TYPE": row["REQUEST TYPE"],
                                            "CATEGORY": row['CATEGORY'],
                                            "TYPE": row["TYPE"],
                                            "DETAIL": row["DETAIL"],
                                            "CREATION DATE": row['CREATION DATE'],
                                            "CREATION TIME": row["CREATION TIME"],
                                            "CREATION MONTH": row["CREATION MONTH"],
                                            "CREATION YEAR": row["CREATION YEAR"],
                                            "STATUS": row["STATUS"],
                                            "EXCEEDED EST TIMEFRAME": row["EXCEEDED EST TIMEFRAME"],
                                            "CLOSED DATE": row["CLOSED DATE"],
                                            "CLOSED MONTH": row["CLOSED MONTH"],
                                            "CLOSED YEAR": row["CLOSED YEAR"],
                                            "DAYS TO CLOSE": row["DAYS TO CLOSE"],
                                            "STREET ADDRESS": row["STREET ADDRESS"],
                                            "ADDRESS WITH GEOCODE": row["ADDRESS WITH GEOCODE"],
                                            "ZIP CODE": row["ZIP CODE"],
                                            "NEIGHBORHOOD": row["NEIGHBORHOOD"],
                                            "COUNTY": row["COUNTY"],
                                            "COUNCIL DISTRICT": row["COUNCIL DISTRICT"],
                                            "POLICE DISTRICT": row["POLICE DISTRICT"],
                                            "PARCEL ID NO": row["PARCEL ID NO"],
                                            "LATITUDE": row["LATITUDE"],
                                            "LONGITUDE": row["LONGITUDE"],
                                            "CASE URL": row["CASE URL"],
                                            "30-60-90 Days Open Window": row["30-60-90 Days Open Window"],
                                            "nbh_id": row["nbh_id"],
                                            "nbh_name": row["nbh_name"],
                                            "BLOCKGROUP ID": row["BLOCKGROUP ID"]
                                        }
                                            return <tr>
                                                {Object.values(newRow).map(val => {
                                                    return <td class='positive'>{val}</td>
                                                })}
                                            </tr>
                                        }
                                    return  <tr>
                                        {Object.values(row).map(val => {
                                            return <td>{val}</td>
                                        })}
                                    </tr>
                                })
                            }
                            {
                                (dummy !== undefined) && dummy.map(row => {
                                    // console.log(row['CASE ID'].toString())
                                    if (row['CASE ID'].toString().includes('2021')){
                                            return <tr>
                                                {Object.values(row).map(val => {
                                                    return <td class='positive'>{val}</td>
                                                })}
                                            </tr>
                                        }
                                    return  <tr>
                                        {Object.values(row).map(val => {
                                            return <td>{val}</td>
                                        })}
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </FirebaseAppProvider>)
    }

    export const SyncSubmission = (data) => {
    console.log(data['submissionDetails'])
    const submissionDetails = data['submissionDetails']
    // easily access the Firestore library
    const newRow = {
        "CASE ID": submissionDetails.case_id,
        "SOURCE": "CHATBOT",
        "DEPARTMENT": submissionDetails.department,
        "WORK GROUP": "",
        "REQUEST TYPE": "",
        "CATEGORY": submissionDetails.category,
        "TYPE": "",
        "DETAIL": "",
        "CREATION DATE": submissionDetails.creation_date,
        "CREATION TIME": submissionDetails.creation_time,
        "CREATION MONTH": submissionDetails.creation_month,
        "CREATION YEAR": submissionDetails.creation_year,
        "STATUS": "OPEN",
        "EXCEEDED EST TIMEFRAME": "N",
        "CLOSED DATE": "",
        "CLOSED MONTH": "",
        "CLOSED YEAR": "",
        "DAYS TO CLOSE": "",
        "STREET ADDRESS": submissionDetails.location,
        "ADDRESS WITH GEOCODE": submissionDetails.location + ` (${submissionDetails.latLng.lat}, ${submissionDetails.latLng.lng} )`,
        "ZIP CODE": submissionDetails.zipcode,
        "NEIGHBORHOOD": submissionDetails.nbh_name,
        "COUNTY": submissionDetails.county,
        "COUNCIL DISTRICT": submissionDetails.council_district,
        "POLICE DISTRICT": submissionDetails.police_district,
        "PARCEL ID NO": "",
        "LATITUDE": submissionDetails.latLng.lat,
        "LONGITUDE": submissionDetails.latLng.lng,
        "CASE URL": submissionDetails.description,
        "30-60-90 Days Open Window": "",
        "nbh_id": submissionDetails.nbh_id,
        "nbh_name": submissionDetails.nbh_name,
        "BLOCKGROUP ID": submissionDetails.blockgroup_id
    }
    console.log(newRow)
    useFirestore().collection("cases").doc(newRow['CASE ID']).set(newRow)
    .then(() => {
        console.log("Document successfully written!");

    }).catch((error) => {
        console.error("Error writing document: ", error);
    });

    return <p>New Record Added To Firebase Successfully!</p>;
}
// export default CaseData