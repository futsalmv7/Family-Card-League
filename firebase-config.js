/* ============================================================
   FAMILY CARD LEAGUE
   FIREBASE CONFIGURATION

   This file is shared by all pages that need Firebase.

   Firebase SDK:
   Modular Firebase JavaScript SDK
============================================================ */


/* ============================================================
   01. FIREBASE IMPORTS
============================================================ */

import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
    getDatabase
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* ============================================================
   02. FIREBASE PROJECT CONFIGURATION
============================================================ */

const firebaseConfig = {

    apiKey:
        "AIzaSyCsGtSH4SDdqkw0cOGGVl9RKXBE2ZAh_Po",

    authDomain:
        "family-card-league.firebaseapp.com",

    /*
       IMPORTANT:

       Replace the line below with the Realtime Database URL
       shown in your Firebase Console.

       Example:
       https://family-card-league-default-rtdb.asia-southeast1.firebasedatabase.app
    */

    databaseURL:
        "https://family-card-league-default-rtdb.asia-southeast1.firebasedatabase.app/",

    projectId:
        "family-card-league",

    storageBucket:
        "family-card-league.firebasestorage.app",

    messagingSenderId:
        "767719995751",

    appId:
        "1:767719995751:web:e1a9d754de7cacb1a557c2",

    measurementId:
        "G-QE14BXETVT"

};


/* ============================================================
   03. INITIALIZE FIREBASE
============================================================ */

const firebaseApp =
    initializeApp(firebaseConfig);


const database =
    getDatabase(firebaseApp);


/* ============================================================
   04. EXPORT FIREBASE SERVICES

   Other JavaScript files can import "database" from here.
============================================================ */

export {
    firebaseApp,
    database
};