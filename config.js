// A. CONFIGURATION (Connected to: PREMIUM MOVIE STUDIO)
const firebaseConfig = { 
    apiKey: "AIzaSyDq_l6aCUPm4SQoDbpROnUc7PMn_nF6kPI", 
    authDomain: "pritam-ott.firebaseapp.com",
    databaseURL: "https://pritam-ott-default-rtdb.firebaseio.com",
    projectId: "pritam-ott",
    storageBucket: "pritam-ott.firebasestorage.app",
    messagingSenderId: "8916733532",
    appId: "1:8916733532:web:8b1143a7352770ff7e6099" 
};

// Initialize Firebase
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const db = firebase.database();

// Global Variables
let allMovies = [], filteredMovies = [], currentPage = 1, globalClicks = {};
let currentPlayingMovieTitle = "", currentPlayingLink = "";
let deferredPrompt;
''