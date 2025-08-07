// Patient Dashboard Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('Patient logged in:', user.uid);
      loadPatientData(user.uid);
      loadUpcomingAppointments(user.uid);
      loadFavoriteDoctors(user.uid);
      setupQuickBooking();
    } else {
      // User is not signed in, redirect to login
      window.location.href = 'auth.html';
    }
  });
});

// Load patient data from Supabase
async function loadPatientData(patientId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const patientData = {
      name: 'Jane Doe',
      upcomingAppointments: 2,
      pastAppointments: 5,
      favoriteDoctors: 3
    };

    // Update UI with patient data
    document.getElementById('patientName').textContent = patientData.name;
    document.getElementById('upcomingAppointmentsCount').textContent = patientData.upcomingAppointments;
    document.getElementById('pastAppointmentsCount').textContent = patientData.pastAppointments;
    document.getElementById('favoriteDoctorsCount').textContent = patientData.favoriteDoctors;
  } catch (error) {
    console.error('Error loading patient data:', error);
  }
}

// Load upcoming appointments
async function loadUpcomingAppointments(patientId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const appointments = [
      {
        id: 1,
        doctorName: 'Dr. John Smith',
        specialty: 'Cardiology',
        date: '2023-06-20',
        time: '10:30 AM',
        status: 'confirmed'
      },
      {
        id: 2,
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Dermatology',
        date: '2023-06-25',
        time: '2:15 PM',
        status: 'confirmed'
      }
    ];

    const appointmentsList = document.getElementById('upcomingAppointmentsList');
    appointmentsList.innerHTML = '';

    if (appointments.length === 0) {
      appointmentsList.innerHTML = '<p>No upcoming appointments</p>';
      return;
    }

    appointments.forEach(appointment => {
      const appointmentItem = document.createElement('div');
      appointmentItem.className = 'appointment-item';
      appointmentItem.innerHTML = `
        <div class="appointment-info">
          <div class="appointment-title">${appointment.doctorName} - ${appointment.specialty}</div>
          <div class="appointment-meta">${appointment.date} at ${appointment.time}</div>
        </div>
        <div class="appointment-actions">
          <button class="btn btn-secondary btn-sm view-btn" data-id="${appointment.id}">View</button>
          <button class="btn btn-danger btn-sm cancel-btn" data-id="${appointment.id}">Cancel</button>
        </div>
      `;
      appointmentsList.appendChild(appointmentItem);
    });

    // Add event listeners for appointment actions
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appointmentId = e.target.getAttribute('data-id');
        viewAppointmentDetail(appointmentId);
      });
    });

    document.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appointmentId = e.target.getAttribute('data-id');
        cancelAppointment(appointmentId);
      });
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

// Load favorite doctors
async function loadFavoriteDoctors(patientId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const doctors = [
      {
        id: 1,
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        rating: 4.8,
        image: '👨‍⚕️'
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson',
        specialty: 'Dermatology',
        rating: 4.9,
        image: '👩‍⚕️'
      },
      {
        id: 3,
        name: 'Dr. Michael Brown',
        specialty: 'Orthopedics',
        rating: 4.7,
        image: '👨‍⚕️'
      }
    ];

    const doctorsGrid = document.getElementById('favoriteDoctorsGrid');
    doctorsGrid.innerHTML = '';

    if (doctors.length === 0) {
      doctorsGrid.innerHTML = '<p>No favorite doctors yet</p>';
      return;
    }

    doctors.forEach(doctor => {
      const doctorCard = document.createElement('div');
      doctorCard.className = 'doctor-card';
      doctorCard.innerHTML = `
        <div class="doctor-avatar">${doctor.image}</div>
        <div class="doctor-name">${doctor.name}</div>
        <div class="doctor-specialty">${doctor.specialty}</div>
        <div class="doctor-rating">⭐ ${doctor.rating}</div>
        <button class="btn btn-primary book-btn" data-id="${doctor.id}">Book Appointment</button>
      `;
      doctorsGrid.appendChild(doctorCard);
    });

    // Add event listeners for booking buttons
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const doctorId = e.target.getAttribute('data-id');
        window.location.href = `patient-book-appointment.html?doctor=${doctorId}`;
      });
    });
  } catch (error) {
    console.error('Error loading favorite doctors:', error);
  }
}

// Setup quick booking functionality
function setupQuickBooking() {
  // Set today's date as default
  const today = new Date();
  document.getElementById('dateFilter').valueAsDate = today;

  // Add event listener for search button
  document.getElementById('searchAvailabilityBtn').addEventListener('click', () => {
    searchAvailability();
  });
}

// Search for available doctors
function searchAvailability() {
  const specialty = document.getElementById('specialtyFilter').value;
  const date = document.getElementById('dateFilter').value;

  // TODO: Replace with actual Supabase API call
  // For now, use mock data
  const availableDoctors = [
    {
      id: 1,
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      availableSlots: [
        { time: '10:30 AM', id: 101 },
        { time: '11:30 AM', id: 102 },
        { time: '2:30 PM', id: 103 }
      ]
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      specialty: 'Dermatology',
      availableSlots: [
        { time: '9:00 AM', id: 201 },
        { time: '1:00 PM', id: 202 }
      ]
    }
  ];

  // Filter by specialty if selected
  let filteredDoctors = availableDoctors;
  if (specialty) {
    filteredDoctors = availableDoctors.filter(doctor => 
      doctor.specialty.toLowerCase() === specialty.toLowerCase());
  }

  displayAvailableDoctors(filteredDoctors, date);
}

// Display available doctors and their slots
function displayAvailableDoctors(doctors, date) {
  const container = document.getElementById('availableDoctorsContainer');
  container.innerHTML = '';

  if (doctors.length === 0) {
    container.innerHTML = '<p>No doctors available for the selected criteria</p>';
    return;
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const heading = document.createElement('h3');
  heading.textContent = `Available Doctors on ${formattedDate}`;
  container.appendChild(heading);

  doctors.forEach(doctor => {
    const doctorCard = document.createElement('div');
    doctorCard.className = 'available-doctor-card';
    
    const doctorInfo = document.createElement('div');
    doctorInfo.className = 'doctor-info';
    doctorInfo.innerHTML = `
      <div class="doctor-name">${doctor.name}</div>
      <div class="doctor-specialty">${doctor.specialty}</div>
    `;
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'available-slots';
    
    doctor.availableSlots.forEach(slot => {
      const slotBtn = document.createElement('button');
      slotBtn.className = 'time-slot available';
      slotBtn.textContent = slot.time;
      slotBtn.setAttribute('data-doctor-id', doctor.id);
      slotBtn.setAttribute('data-slot-id', slot.id);
      slotBtn.setAttribute('data-date', date);
      slotBtn.setAttribute('data-time', slot.time);
      
      slotBtn.addEventListener('click', (e) => {
        const doctorId = e.target.getAttribute('data-doctor-id');
        const slotId = e.target.getAttribute('data-slot-id');
        const slotDate = e.target.getAttribute('data-date');
        const slotTime = e.target.getAttribute('data-time');
        
        quickBookAppointment(doctorId, slotId, slotDate, slotTime, doctor.name, doctor.specialty);
      });
      
      slotsContainer.appendChild(slotBtn);
    });
    
    doctorCard.appendChild(doctorInfo);
    doctorCard.appendChild(slotsContainer);
    container.appendChild(doctorCard);
  });
}

// Quick book appointment
function quickBookAppointment(doctorId, slotId, date, time, doctorName, specialty) {
  if (confirm(`Confirm appointment with ${doctorName} on ${date} at ${time}?`)) {
    // TODO: Replace with actual Supabase API call to book appointment
    console.log('Booking appointment:');
    console.log('Doctor ID:', doctorId);
    console.log('Slot ID:', slotId);
    console.log('Date:', date);
    console.log('Time:', time);
    
    // Show success message
    alert('Appointment booked successfully!');
    
    // Reload appointments
    loadUpcomingAppointments(auth.currentUser.uid);
    
    // Clear search results
    document.getElementById('availableDoctorsContainer').innerHTML = '';
  }
}

// View appointment detail
function viewAppointmentDetail(appointmentId) {
  // TODO: Implement appointment detail view
  console.log(`View appointment ${appointmentId}`);
}

// Cancel appointment
function cancelAppointment(appointmentId) {
  // TODO: Implement appointment cancellation
  if (confirm('Are you sure you want to cancel this appointment?')) {
    console.log(`Cancel appointment ${appointmentId}`);
    // After cancellation, reload appointments
    loadUpcomingAppointments(auth.currentUser.uid);
  }
}