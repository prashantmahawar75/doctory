// Firebase Configuration
const firebaseConfig = {
  apiKey: "  ",
  authDomain: "",
  projectId: " ",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get Auth instance
const auth = firebase.auth();

// Export the auth object for use in other scripts
window.auth = auth;
