import firebase from "firebase/app"
import "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAuqrJSVK3_RyZkIPGt2nqt2XMM9XvLad8",
  authDomain: "nsfscc-umkc.firebaseapp.com",
  projectId: "nsfscc-umkc",
  storageBucket: "nsfscc-umkc.appspot.com",
  messagingSenderId: "1051748532808",
  appId: "1:1051748532808:web:329f4b10628ab679a38e7d",
  measurementId: "G-3NK4G5XJZM"
};

firebase.initializeApp(firebaseConfig)
const storage = firebase.storage()

export {storage, firebase as default}