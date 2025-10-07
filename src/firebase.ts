// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRONY082OGGzb5LtGb909DaA0Sy8mKZTY",
  authDomain: "filipinoemigrantsdb-bec10.firebaseapp.com",
  projectId: "filipinoemigrantsdb-bec10",
  storageBucket: "filipinoemigrantsdb-bec10.firebasestorage.app",
  messagingSenderId: "410559760099",
  appId: "1:410559760099:web:f60629f03f86307e3667d6",
  measurementId: "G-GMB855HNJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);