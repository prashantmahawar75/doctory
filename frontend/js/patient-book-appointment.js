// Patient Book Appointment Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('Patient logged in:', user.uid);
      initializeBookingProcess(user.uid);
    } else {
      // User is not signed in, redirect to login
      window.location.href = 'auth.html';
    }
  });
});

// Initialize the booking process
function initializeBookingProcess(patientId) {
  // Check if a specific doctor was pre-selected (from URL parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedDoctorId = urlParams.get('doctor');
  
  if (preSelectedDoctorId) {
    // Pre-select the doctor and move to step 2
    loadDoctorDetails(preSelectedDoctorId);
    goToStep(2);
  } else {
    // Start from step 1 - doctor selection
    loadSpecialties();
    setupSearchFunctionality();
    goToStep(1);
  }
  
  // Setup navigation buttons
  setupStepNavigation();
}

// Load available specialties
async function loadSpecialties() {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const specialties = [
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Ophthalmology',
      'Gynecology'
    ];
    
    const specialtySelect = document.getElementById('specialtyFilter');
    specialtySelect.innerHTML = '<option value="">All Specialties</option>';
    
    specialties.forEach(specialty => {
      const option = document.createElement('option');
      option.value = specialty;
      option.textContent = specialty;
      specialtySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading specialties:', error);
  }
}

// Setup search functionality
function setupSearchFunctionality() {
  // Set today's date as default
  const today = new Date();
  document.getElementById('dateFilter').valueAsDate = today;
  
  // Add event listener for search button
  document.getElementById('searchDoctorsBtn').addEventListener('click', () => {
    searchDoctors();
  });
}

// Search for doctors
async function searchDoctors() {
  try {
    const specialty = document.getElementById('specialtyFilter').value;
    const date = document.getElementById('dateFilter').value;
    const name = document.getElementById('nameFilter').value;
    
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    let doctors = [
      {
        id: 1,
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        rating: 4.8,
        image: '👨‍⚕️',
        about: 'Experienced cardiologist with over 15 years of practice.'
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson',
        specialty: 'Dermatology',
        rating: 4.9,
        image: '👩‍⚕️',
        about: 'Specializes in cosmetic dermatology and skin cancer treatments.'
      },
      {
        id: 3,
        name: 'Dr. Michael Brown',
        specialty: 'Orthopedics',
        rating: 4.7,
        image: '👨‍⚕️',
        about: 'Sports medicine specialist focusing on knee and shoulder injuries.'
      },
      {
        id: 4,
        name: 'Dr. Emily Davis',
        specialty: 'Neurology',
        rating: 4.6,
        image: '👩‍⚕️',
        about: 'Specializes in headache disorders and multiple sclerosis.'
      },
      {
        id: 5,
        name: 'Dr. Robert Wilson',
        specialty: 'Pediatrics',
        rating: 4.9,
        image: '👨‍⚕️',
        about: 'Caring pediatrician with a focus on developmental disorders.'
      }
    ];
    
    // Filter by specialty if selected
    if (specialty) {
      doctors = doctors.filter(doctor => 
        doctor.specialty.toLowerCase() === specialty.toLowerCase());
    }
    
    // Filter by name if entered
    if (name) {
      doctors = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(name.toLowerCase()));
    }
    
    displayDoctorResults(doctors, date);
  } catch (error) {
    console.error('Error searching doctors:', error);
  }
}

// Display doctor search results
function displayDoctorResults(doctors, date) {
  const resultsContainer = document.getElementById('doctorSearchResults');
  resultsContainer.innerHTML = '';
  
  if (doctors.length === 0) {
    resultsContainer.innerHTML = '<p class="no-results">No doctors found matching your criteria</p>';
    return;
  }
  
  doctors.forEach(doctor => {
    const doctorCard = document.createElement('div');
    doctorCard.className = 'doctor-card';
    doctorCard.innerHTML = `
      <div class="doctor-avatar">${doctor.image}</div>
      <div class="doctor-details">
        <h3 class="doctor-name">${doctor.name}</h3>
        <div class="doctor-specialty">${doctor.specialty}</div>
        <div class="doctor-rating">⭐ ${doctor.rating}</div>
        <p class="doctor-about">${doctor.about}</p>
      </div>
      <button class="btn btn-primary select-doctor-btn" data-id="${doctor.id}">Select</button>
    `;
    
    resultsContainer.appendChild(doctorCard);
  });
  
  // Add event listeners for doctor selection
  document.querySelectorAll('.select-doctor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const doctorId = e.target.getAttribute('data-id');
      selectDoctor(doctorId);
    });
  });
}

// Select a doctor and proceed to step 2
function selectDoctor(doctorId) {
  loadDoctorDetails(doctorId);
  goToStep(2);
}

// Load doctor details for step 2
async function loadDoctorDetails(doctorId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const doctors = [
      {
        id: 1,
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        rating: 4.8,
        image: '👨‍⚕️',
        about: 'Experienced cardiologist with over 15 years of practice.'
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson',
        specialty: 'Dermatology',
        rating: 4.9,
        image: '👩‍⚕️',
        about: 'Specializes in cosmetic dermatology and skin cancer treatments.'
      },
      {
        id: 3,
        name: 'Dr. Michael Brown',
        specialty: 'Orthopedics',
        rating: 4.7,
        image: '👨‍⚕️',
        about: 'Sports medicine specialist focusing on knee and shoulder injuries.'
      },
      {
        id: 4,
        name: 'Dr. Emily Davis',
        specialty: 'Neurology',
        rating: 4.6,
        image: '👩‍⚕️',
        about: 'Specializes in headache disorders and multiple sclerosis.'
      },
      {
        id: 5,
        name: 'Dr. Robert Wilson',
        specialty: 'Pediatrics',
        rating: 4.9,
        image: '👨‍⚕️',
        about: 'Caring pediatrician with a focus on developmental disorders.'
      }
    ];
    
    const doctor = doctors.find(d => d.id == doctorId);
    
    if (!doctor) {
      console.error('Doctor not found');
      return;
    }
    
    // Update doctor info in step 2
    document.getElementById('selectedDoctorName').textContent = doctor.name;
    document.getElementById('selectedDoctorSpecialty').textContent = doctor.specialty;
    document.getElementById('selectedDoctorAvatar').textContent = doctor.image;
    
    // Store selected doctor ID for later use
    document.getElementById('bookingForm').setAttribute('data-doctor-id', doctorId);
    
    // Load available dates for this doctor
    loadAvailableDates(doctorId);
  } catch (error) {
    console.error('Error loading doctor details:', error);
  }
}

// Load available dates for the selected doctor
async function loadAvailableDates(doctorId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, generate dates for the next 14 days
    const dateContainer = document.getElementById('availableDates');
    dateContainer.innerHTML = '';
    
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateBtn = document.createElement('button');
      dateBtn.className = 'date-option';
      dateBtn.setAttribute('data-date', date.toISOString().split('T')[0]);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      dateBtn.innerHTML = `
        <div class="date-day">${dayName}</div>
        <div class="date-num">${dayNum}</div>
        <div class="date-month">${month}</div>
      `;
      
      dateBtn.addEventListener('click', (e) => {
        // Remove active class from all date buttons
        document.querySelectorAll('.date-option').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to selected date button
        e.target.closest('.date-option').classList.add('active');
        
        // Load time slots for selected date
        const selectedDate = e.target.closest('.date-option').getAttribute('data-date');
        loadTimeSlots(doctorId, selectedDate);
      });
      
      dateContainer.appendChild(dateBtn);
    }
    
    // Select first date by default
    if (dateContainer.firstChild) {
      dateContainer.firstChild.click();
    }
  } catch (error) {
    console.error('Error loading available dates:', error);
  }
}

// Load time slots for selected date
async function loadTimeSlots(doctorId, date) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const timeSlots = [
      { id: 1, time: '09:00 AM', available: true },
      { id: 2, time: '09:30 AM', available: true },
      { id: 3, time: '10:00 AM', available: false },
      { id: 4, time: '10:30 AM', available: true },
      { id: 5, time: '11:00 AM', available: true },
      { id: 6, time: '11:30 AM', available: false },
      { id: 7, time: '01:00 PM', available: true },
      { id: 8, time: '01:30 PM', available: true },
      { id: 9, time: '02:00 PM', available: false },
      { id: 10, time: '02:30 PM', available: true },
      { id: 11, time: '03:00 PM', available: true },
      { id: 12, time: '03:30 PM', available: true },
      { id: 13, time: '04:00 PM', available: false },
      { id: 14, time: '04:30 PM', available: true }
    ];
    
    const timeSlotsContainer = document.getElementById('availableTimeSlots');
    timeSlotsContainer.innerHTML = '';
    
    // Display selected date
    const selectedDateObj = new Date(date);
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    document.getElementById('selectedDate').textContent = formattedDate;
    
    // Create morning and afternoon sections
    const morningSlots = document.createElement('div');
    morningSlots.className = 'time-slots-section';
    morningSlots.innerHTML = '<h4>Morning</h4><div class="time-slots-grid" id="morningSlots"></div>';
    
    const afternoonSlots = document.createElement('div');
    afternoonSlots.className = 'time-slots-section';
    afternoonSlots.innerHTML = '<h4>Afternoon</h4><div class="time-slots-grid" id="afternoonSlots"></div>';
    
    timeSlotsContainer.appendChild(morningSlots);
    timeSlotsContainer.appendChild(afternoonSlots);
    
    const morningContainer = document.getElementById('morningSlots');
    const afternoonContainer = document.getElementById('afternoonSlots');
    
    timeSlots.forEach(slot => {
      const timeBtn = document.createElement('button');
      timeBtn.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;
      timeBtn.textContent = slot.time;
      timeBtn.setAttribute('data-slot-id', slot.id);
      timeBtn.setAttribute('data-time', slot.time);
      
      if (slot.available) {
        timeBtn.addEventListener('click', (e) => {
          // Remove active class from all time buttons
          document.querySelectorAll('.time-slot').forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Add active class to selected time button
          e.target.classList.add('active');
          
          // Store selected time slot
          const selectedTime = e.target.getAttribute('data-time');
          const selectedSlotId = e.target.getAttribute('data-slot-id');
          
          document.getElementById('bookingForm').setAttribute('data-slot-id', selectedSlotId);
          document.getElementById('bookingForm').setAttribute('data-time', selectedTime);
          document.getElementById('bookingForm').setAttribute('data-date', date);
          
          // Enable next button
          document.getElementById('nextToStep3').disabled = false;
        });
      } else {
        timeBtn.disabled = true;
      }
      
      // Check if morning or afternoon
      if (slot.time.includes('AM')) {
        morningContainer.appendChild(timeBtn);
      } else {
        afternoonContainer.appendChild(timeBtn);
      }
    });
    
    // Disable next button until a time slot is selected
    document.getElementById('nextToStep3').disabled = true;
  } catch (error) {
    console.error('Error loading time slots:', error);
  }
}

// Setup step navigation
function setupStepNavigation() {
  // Next buttons
  document.getElementById('nextToStep3').addEventListener('click', () => {
    prepareConfirmationStep();
    goToStep(3);
  });
  
  // Back buttons
  document.getElementById('backToStep1').addEventListener('click', () => {
    goToStep(1);
  });
  
  document.getElementById('backToStep2').addEventListener('click', () => {
    goToStep(2);
  });
  
  // Confirm booking button
  document.getElementById('confirmBookingBtn').addEventListener('click', () => {
    confirmBooking();
  });
}

// Prepare confirmation step
function prepareConfirmationStep() {
  const bookingForm = document.getElementById('bookingForm');
  const doctorId = bookingForm.getAttribute('data-doctor-id');
  const slotId = bookingForm.getAttribute('data-slot-id');
  const date = bookingForm.getAttribute('data-date');
  const time = bookingForm.getAttribute('data-time');
  
  // Display booking details in confirmation step
  document.getElementById('confirmDoctorName').textContent = document.getElementById('selectedDoctorName').textContent;
  document.getElementById('confirmDoctorSpecialty').textContent = document.getElementById('selectedDoctorSpecialty').textContent;
  
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  document.getElementById('confirmDate').textContent = formattedDate;
  document.getElementById('confirmTime').textContent = time;
  
  // Get reason for visit
  const reasonInput = document.getElementById('visitReason');
  reasonInput.addEventListener('input', () => {
    document.getElementById('confirmReason').textContent = reasonInput.value || 'Not specified';
  });
  
  // Initialize with current value
  document.getElementById('confirmReason').textContent = reasonInput.value || 'Not specified';
}

// Confirm booking
async function confirmBooking() {
  try {
    const bookingForm = document.getElementById('bookingForm');
    const doctorId = bookingForm.getAttribute('data-doctor-id');
    const slotId = bookingForm.getAttribute('data-slot-id');
    const date = bookingForm.getAttribute('data-date');
    const time = bookingForm.getAttribute('data-time');
    const reason = document.getElementById('visitReason').value;
    
    // TODO: Replace with actual Supabase API call to create appointment
    console.log('Booking appointment:');
    console.log('Doctor ID:', doctorId);
    console.log('Slot ID:', slotId);
    console.log('Date:', date);
    console.log('Time:', time);
    console.log('Reason:', reason);
    
    // Simulate API call delay
    document.getElementById('confirmBookingBtn').disabled = true;
    document.getElementById('confirmBookingBtn').textContent = 'Processing...';
    
    // Simulate API response
    setTimeout(() => {
      // Show success message
      document.getElementById('bookingSteps').style.display = 'none';
      document.getElementById('bookingConfirmation').style.display = 'block';
      
      // Display confirmation details
      document.getElementById('successDoctorName').textContent = document.getElementById('selectedDoctorName').textContent;
      document.getElementById('successDate').textContent = document.getElementById('confirmDate').textContent;
      document.getElementById('successTime').textContent = time;
      
      // Generate a random appointment ID
      const appointmentId = Math.floor(100000 + Math.random() * 900000);
      document.getElementById('appointmentId').textContent = appointmentId;
    }, 1500);
  } catch (error) {
    console.error('Error confirming booking:', error);
    alert('There was an error booking your appointment. Please try again.');
    document.getElementById('confirmBookingBtn').disabled = false;
    document.getElementById('confirmBookingBtn').textContent = 'Confirm Booking';
  }
}

// Go to dashboard button
document.getElementById('goToDashboardBtn').addEventListener('click', () => {
  window.location.href = 'patient-dashboard.html';
});

// Book another appointment button
document.getElementById('bookAnotherBtn').addEventListener('click', () => {
  // Reset the form and go back to step 1
  document.getElementById('bookingSteps').style.display = 'block';
  document.getElementById('bookingConfirmation').style.display = 'none';
  document.getElementById('confirmBookingBtn').disabled = false;
  document.getElementById('confirmBookingBtn').textContent = 'Confirm Booking';
  document.getElementById('visitReason').value = '';
  goToStep(1);
});

// Navigate between steps
function goToStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.booking-step').forEach(step => {
    step.style.display = 'none';
  });
  
  // Show the selected step
  document.getElementById(`step${stepNumber}`).style.display = 'block';
  
  // Update progress indicator
  document.querySelectorAll('.step-indicator').forEach(indicator => {
    indicator.classList.remove('active', 'completed');
  });
  
  for (let i = 1; i <= stepNumber; i++) {
    if (i < stepNumber) {
      document.querySelector(`.step-indicator[data-step="${i}"]`).classList.add('completed');
    } else {
      document.querySelector(`.step-indicator[data-step="${i}"]`).classList.add('active');
    }
  }
}