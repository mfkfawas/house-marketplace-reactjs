// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCow8t63OPvrFJx0XjiX_NZqYfpiPrptF8',
  authDomain: 'house-marketplace-app-6bf77.firebaseapp.com',
  projectId: 'house-marketplace-app-6bf77',
  storageBucket: 'house-marketplace-app-6bf77.appspot.com',
  messagingSenderId: '989951164304',
  appId: '1:989951164304:web:ccde0d4e34e2cfd62a3d15',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
