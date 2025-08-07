// Authentication functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user.uid);
      updateUIForAuthenticatedUser(user);
    } else {
      // User is signed out
      console.log('User is signed out');
      updateUIForUnauthenticatedUser();
    }
  });

  // Setup auth UI elements if they exist
  setupAuthUI();
});

// Setup authentication UI elements
function setupAuthUI() {
  // Login/Register tabs
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });

    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
    });
  }

  // Check if we're on the auth page
  if (window.location.pathname.includes('auth.html')) {
    // Get user type from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');
    const userTypeIndicator = document.getElementById('userTypeIndicator');

    if (userType && userTypeIndicator) {
      userTypeIndicator.textContent = userType === 'doctor' ? 'Doctor Account' : 'Patient Account';
      userTypeIndicator.classList.add(userType === 'doctor' ? 'doctor-type' : 'patient-type');

      // Show appropriate fields based on user type
      if (userType === 'doctor') {
        document.getElementById('doctorFields').style.display = 'block';
      } else if (userType === 'patient') {
        document.getElementById('patientFields').style.display = 'block';
      }
    }

    // Login form submission
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Sign in with email and password
        auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User logged in:', user.uid);
            
            // Redirect based on user type (stored in user custom claims or Firestore)
            checkUserTypeAndRedirect(user);
          })
          .catch((error) => {
            console.error('Login error:', error);
            alert(`Login failed: ${error.message}`);
          });
      });
    }

    // Register form submission
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const userType = urlParams.get('type');

        if (!userType) {
          alert('Please specify whether you are registering as a doctor or patient');
          return;
        }

        // Create user with email and password
        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            console.log('User registered:', user.uid);

            // Update user profile
            return user.updateProfile({
              displayName: name
            }).then(() => {
              // Save additional user data to Supabase
              saveUserDataToSupabase(user.uid, name, email, userType);
            });
          })
          .catch((error) => {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
          });
      });
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        if (!email) {
          alert('Please enter your email address');
          return;
        }

        // Send password reset email
        auth.sendPasswordResetEmail(email)
          .then(() => {
            alert('Password reset email sent. Check your inbox.');
          })
          .catch((error) => {
            console.error('Password reset error:', error);
            alert(`Password reset failed: ${error.message}`);
          });
      });
    }
  }

  // Logout buttons
  const logoutBtns = document.querySelectorAll('#logoutBtn, #sidebarLogoutBtn');
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
          // Sign-out successful
          window.location.href = '../index.html';
        }).catch((error) => {
          // An error happened
          console.error('Logout error:', error);
        });
      });
    }
  });
}

// Save user data to Supabase
async function saveUserDataToSupabase(userId, name, email, userType) {
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client is not initialized');
    }

    console.log('Saving user data to Supabase...', { userId, name, email, userType });
    const tableName = userType === 'doctor' ? 'doctors' : 'patients';
    
    // First check if user already exists
    const { data: existingUser, error: checkError } = await window.supabaseClient
      .from(tableName)
      .select('id')
      .eq('firebase_uid', userId)
      .single();

    if (existingUser) {
      console.log('User already exists in Supabase');
      // Redirect based on user type
      window.location.href = userType === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
      return;
    }

    // Prepare user data based on user type
    let userData = {
      firebase_uid: userId,
      name: name,
      email: email,
      created_at: new Date().toISOString()
    };

    if (userType === 'doctor') {
      const specialty = document.getElementById('specialization')?.value;
      const licenseNumber = document.getElementById('licenseNumber')?.value;
      
      if (!specialty || !licenseNumber) {
        throw new Error('Specialty and license number are required for doctors');
      }

      userData.specialty = specialty;
      userData.license_number = licenseNumber;
    } else if (userType === 'patient') {
      const dob = document.getElementById('dateOfBirth')?.value;
      const phone = document.getElementById('phoneNumber')?.value;

      if (dob) userData.dob = dob;
      if (phone) userData.phone = phone;
    }

    console.log('Inserting user data:', userData);

    // Save to Supabase
    const { data, error } = await window.supabaseClient
      .from(tableName)
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to save user data: ${error.message}`);
    }

    console.log('User data saved successfully:', data);

    // Redirect based on user type
    window.location.href = userType === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
  } catch (error) {
    console.error('Error saving user data:', error);
    // Show a more specific error message
    alert(error.message || 'Failed to save profile data. Please try again or contact support.');
    throw error; // Re-throw to handle in the calling function
  }
}

// Check user type and redirect to appropriate dashboard
async function checkUserTypeAndRedirect(user) {
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client is not initialized');
    }

    // First try to find user in doctors table
    const { data: doctor, error: doctorError } = await window.supabaseClient
      .from('doctors')
      .select('id')
      .eq('firebase_uid', user.uid)
      .single();

    if (doctor) {
      console.log('User found in doctors table:', doctor);
      window.location.href = 'doctor-dashboard.html';
      return;
    }

    // If not a doctor, check patients table
    const { data: patient, error: patientError } = await window.supabaseClient
      .from('patients')
      .select('id')
      .eq('firebase_uid', user.uid)
      .single();

    if (patient) {
      console.log('User found in patients table:', patient);
      window.location.href = 'patient-dashboard.html';
      return;
    }

    // If user not found in either table, they need to complete registration
    console.log('User not found in either table:', user.uid);
    window.location.href = 'auth.html?type=patient&complete=true';
  } catch (error) {
    console.error('Error checking user type:', error);
    alert('Failed to determine user type. Please try again or contact support.');
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    authBtn.textContent = 'Dashboard';
    // Determine the correct dashboard URL based on user type
    // This would normally be fetched from Supabase
    // For now, we'll use a placeholder
    authBtn.href = 'pages/patient-dashboard.html';
  }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    authBtn.textContent = 'Sign In';
    authBtn.href = 'pages/auth.html';
  }
}



//////////////////////////////
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { 
//   getAuth, 
//   onAuthStateChanged, 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword, 
//   updateProfile, 
//   sendPasswordResetEmail, 
//   signOut 
// } from "firebase/auth";
// // Note: If you decide to use Firestore, you would import it here
// // import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDMKE1ZDj8ZE9fBJm7Y7NhXzj0VWLugl74",
//   authDomain: "doctor-appointment-app-63cd2.firebaseapp.com",
//   projectId: "doctor-appointment-app-63cd2",
//   storageBucket: "doctor-appointment-app-63cd2.appspot.com", // Corrected domain
//   messagingSenderId: "410094677145",
//   appId: "1:410094677145:web:edd6397e983bc1ceffdc08",
//   measurementId: "G-2VP21YN57E"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// // Initialize Firebase Authentication and get a reference to the service
// const auth = getAuth(app);
// // If using Firestore, you would initialize it like this:
// // const db = getFirestore(app);


// // --- YOUR EXISTING AUTHENTICATION LOGIC ---

// document.addEventListener('DOMContentLoaded', () => {
//   // Check if user is already logged in
//   onAuthStateChanged(auth, user => {
//     if (user) {
//       // User is signed in
//       console.log('User is signed in:', user.uid);
//       updateUIForAuthenticatedUser(user);
//     } else {
//       // User is signed out
//       console.log('User is signed out');
//       updateUIForUnauthenticatedUser();
//     }
//   });

//   // Setup auth UI elements if they exist
//   setupAuthUI();
// });

// // Setup authentication UI elements
// function setupAuthUI() {
//   // Login/Register tabs
//   const loginTab = document.getElementById('loginTab');
//   const registerTab = document.getElementById('registerTab');
//   const loginForm = document.getElementById('loginForm');
//   const registerForm = document.getElementById('registerForm');

//   if (loginTab && registerTab) {
//     loginTab.addEventListener('click', () => {
//       loginTab.classList.add('active');
//       registerTab.classList.remove('active');
//       loginForm.style.display = 'block';
//       registerForm.style.display = 'none';
//     });

//     registerTab.addEventListener('click', () => {
//       registerTab.classList.add('active');
//       loginTab.classList.remove('active');
//       registerForm.style.display = 'block';
//       loginForm.style.display = 'none';
//     });
//   }

//   // Check if we're on the auth page
//   if (window.location.pathname.includes('auth.html')) {
//     // Get user type from URL parameter
//     const urlParams = new URLSearchParams(window.location.search);
//     const userType = urlParams.get('type');
//     const userTypeIndicator = document.getElementById('userTypeIndicator');

//     if (userType && userTypeIndicator) {
//       userTypeIndicator.textContent = userType === 'doctor' ? 'Doctor Account' : 'Patient Account';
//       userTypeIndicator.classList.add(userType === 'doctor' ? 'doctor-type' : 'patient-type');

//       // Show appropriate fields based on user type
//       if (userType === 'doctor') {
//         document.getElementById('doctorFields').style.display = 'block';
//       } else if (userType === 'patient') {
//         document.getElementById('patientFields').style.display = 'block';
//       }
//     }

//     // Login form submission
//     if (loginForm) {
//       loginForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const email = document.getElementById('loginEmail').value;
//         const password = document.getElementById('loginPassword').value;

//         // Sign in with email and password
//         signInWithEmailAndPassword(auth, email, password)
//           .then((userCredential) => {
//             // Signed in
//             const user = userCredential.user;
//             console.log('User logged in:', user.uid);
            
//             // Redirect based on user type (stored in Firestore or another DB)
//             checkUserTypeAndRedirect(user);
//           })
//           .catch((error) => {
//             console.error('Login error:', error);
//             alert(`Login failed: ${error.message}`);
//           });
//       });
//     }

//     // Register form submission
//     if (registerForm) {
//       registerForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const name = document.getElementById('registerName').value;
//         const email = document.getElementById('registerEmail').value;
//         const password = document.getElementById('registerPassword').value;
//         const confirmPassword = document.getElementById('registerConfirmPassword').value;
//         const userType = new URLSearchParams(window.location.search).get('type');

//         // Validate passwords match
//         if (password !== confirmPassword) {
//           alert('Passwords do not match');
//           return;
//         }

//         // Create user with email and password
//         createUserWithEmailAndPassword(auth, email, password)
//           .then((userCredential) => {
//             // Signed up
//             const user = userCredential.user;
//             console.log('User registered:', user.uid);

//             // Update user profile
//             return updateProfile(user, {
//               displayName: name
//             }).then(() => {
//               // Save additional user data to your database (Firestore or Supabase)
//               saveUserData(user.uid, name, email, userType);
//             });
//           })
//           .catch((error) => {
//             console.error('Registration error:', error);
//             alert(`Registration failed: ${error.message}`);
//           });
//       });
//     }

//     // Forgot password link
//     const forgotPasswordLink = document.getElementById('forgotPassword');
//     if (forgotPasswordLink) {
//       forgotPasswordLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         const email = document.getElementById('loginEmail').value;
//         if (!email) {
//           alert('Please enter your email address');
//           return;
//         }

//         // Send password reset email
//         sendPasswordResetEmail(auth, email)
//           .then(() => {
//             alert('Password reset email sent. Check your inbox.');
//           })
//           .catch((error) => {
//             console.error('Password reset error:', error);
//             alert(`Password reset failed: ${error.message}`);
//           });
//       });
//     }
//   }

//   // Logout buttons
//   const logoutBtns = document.querySelectorAll('#logoutBtn, #sidebarLogoutBtn');
//   logoutBtns.forEach(btn => {
//     if (btn) {
//       btn.addEventListener('click', (e) => {
//         e.preventDefault();
//         signOut(auth).then(() => {
//           // Sign-out successful
//           window.location.href = '../index.html';
//         }).catch((error) => {
//           // An error happened
//           console.error('Logout error:', error);
//         });
//       });
//     }
//   });
// }

// // ⚠️ IMPORTANT: This function needs to be implemented with your database choice.
// async function saveUserData(userId, name, email, userType) {
//   try {
//     // This is a placeholder. You need to replace this with a real database call.
//     // OPTION 1: Using Firebase Firestore (Recommended for a Firebase project)
//     /*
//     const userDocRef = doc(db, "users", userId);
//     let userData = {
//         uid: userId,
//         name: name,
//         email: email,
//         userType: userType,
//         createdAt: new Date()
//     };
//     if (userType === 'doctor') {
//         userData.specialization = document.getElementById('specialization').value;
//         userData.licenseNumber = document.getElementById('licenseNumber').value;
//     } else {
//         userData.dateOfBirth = document.getElementById('dateOfBirth').value;
//         userData.phoneNumber = document.getElementById('phoneNumber').value;
//     }
//     await setDoc(userDocRef, userData);
//     console.log("User data saved to Firestore");
//     */

//     // OPTION 2: Using Supabase (As per your original comments)
//     // You would need the Supabase client library and make an API call here.
//     console.log('Simulating saving user data:', { userId, name, email, userType });

//     // Redirect after successful save
//     if (userType === 'doctor') {
//       window.location.href = 'doctor-dashboard.html';
//     } else {
//       window.location.href = 'patient-dashboard.html';
//     }

//   } catch (error) {
//     console.error('Error saving user data:', error);
//     alert('Account created but failed to save profile data. Please contact support.');
//   }
// }

// // ⚠️ IMPORTANT: This function needs to be implemented with your database choice.
// async function checkUserTypeAndRedirect(user) {
//   try {
//     // This is a placeholder. You need to get the user's role from your database.
//     // OPTION 1: Using Firebase Firestore
//     /*
//     const userDocRef = doc(db, "users", user.uid);
//     const userDoc = await getDoc(userDocRef);
//     if (userDoc.exists()) {
//         const userType = userDoc.data().userType;
//         if (userType === 'doctor') {
//             window.location.href = 'doctor-dashboard.html';
//         } else {
//             window.location.href = 'patient-dashboard.html';
//         }
//     } else {
//         throw new Error("User data not found in database.");
//     }
//     */
    
//     // For now, simulating check and redirect
//     console.log("Simulating check for user type and redirecting...");
//     // The random logic here is just for demonstration.
//     setTimeout(() => {
//       alert("Login successful! NOTE: Redirect is random for this demo. Implement database logic in checkUserTypeAndRedirect().");
//       const randomType = Math.random() > 0.5 ? 'doctor' : 'patient';
//       if (randomType === 'doctor') {
//         window.location.href = 'doctor-dashboard.html';
//       } else {
//         window.location.href = 'patient-dashboard.html';
//       }
//     }, 500);

//   } catch (error) {
//     console.error('Error checking user type:', error);
//     alert('Failed to determine user type. Please contact support.');
//   }
// }

// // Update UI for authenticated user
// function updateUIForAuthenticatedUser(user) {
//     // This function can be improved by checking the user's actual role
//     const authBtn = document.getElementById('authBtn');
//     if (authBtn) {
//         authBtn.textContent = 'Dashboard';
//         // You should ideally call a function here to get the user's role
//         // and set the correct dashboard link.
//         authBtn.href = '#'; // Placeholder, as we don't know the role yet
//         console.log("User is logged in, dashboard button updated.");
//     }
// }

// // Update UI for unauthenticated user
// function updateUIForUnauthenticatedUser() {
//     const authBtn = document.getElementById('authBtn');
//     if (authBtn) {
//         authBtn.textContent = 'Sign In';
//         authBtn.href = 'pages/auth.html';
//     }
// }