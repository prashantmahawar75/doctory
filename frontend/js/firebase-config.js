// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMKE1ZDj8ZE9fBJm7Y7NhXzj0VWLugl74",
  authDomain: "doctor-appointment-app-63cd2.firebaseapp.com",
  projectId: "doctor-appointment-app-63cd2",
  storageBucket: "doctor-appointment-app-63cd2.firebasestorage.app",
  messagingSenderId: "410094677145",
  appId: "1:410094677145:web:edd6397e983bc1ceffdc08",
  measurementId: "G-2VP21YN57E"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get Auth instance
const auth = firebase.auth();

// Export the auth object for use in other scripts
window.auth = auth;