// Doctor Dashboard Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('Doctor logged in:', user.uid);
      loadDoctorData(user.uid);
      initializeCalendar();
      loadUpcomingAppointments(user.uid);
    } else {
      // User is not signed in, redirect to login
      window.location.href = 'auth.html';
    }
  });
});

// Load doctor data from Supabase
async function loadDoctorData(doctorId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const doctorData = {
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      todayAppointments: 5,
      weekAppointments: 23,
      totalPatients: 148,
      availableSlots: 12
    };

    // Update UI with doctor data
    document.getElementById('doctorName').textContent = doctorData.name;
    document.getElementById('doctorSpecialty').textContent = doctorData.specialty;
    document.getElementById('todayAppointments').textContent = doctorData.todayAppointments;
    document.getElementById('weekAppointments').textContent = doctorData.weekAppointments;
    document.getElementById('totalPatients').textContent = doctorData.totalPatients;
    document.getElementById('availableSlots').textContent = doctorData.availableSlots;
  } catch (error) {
    console.error('Error loading doctor data:', error);
  }
}

// Initialize calendar
function initializeCalendar() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Update calendar title
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  // Generate calendar grid
  generateCalendarGrid(currentMonth, currentYear);
  
  // Add event listeners for navigation
  document.getElementById('prevMonth').addEventListener('click', () => {
    navigateMonth(-1);
  });
  
  document.getElementById('nextMonth').addEventListener('click', () => {
    navigateMonth(1);
  });
  
  // Add event listeners for view options
  document.getElementById('monthViewBtn').addEventListener('click', () => {
    setCalendarView('month');
  });
  
  document.getElementById('weekViewBtn').addEventListener('click', () => {
    setCalendarView('week');
  });
  
  document.getElementById('dayViewBtn').addEventListener('click', () => {
    setCalendarView('day');
  });
}

// Generate calendar grid for month view
function generateCalendarGrid(month, year) {
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  
  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  
  // Add days of the month
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    // Highlight current day
    if (day === currentDay && month === currentMonth && year === currentYear) {
      dayCell.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);
    
    // Add sample events (would be replaced with actual appointments)
    if (Math.random() > 0.7) {
      const numEvents = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numEvents; i++) {
        const event = document.createElement('div');
        event.className = 'calendar-event';
        event.textContent = `Patient ${Math.floor(Math.random() * 100)}`;
        dayCell.appendChild(event);
      }
    }
    
    // Add click event to show day detail
    dayCell.addEventListener('click', () => {
      showDayDetail(day, month, year);
    });
    
    calendarGrid.appendChild(dayCell);
  }
}

// Navigate to previous or next month
function navigateMonth(direction) {
  const currentMonthText = document.getElementById('currentMonth').textContent;
  const [monthName, year] = currentMonthText.split(' ');
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let month = monthNames.indexOf(monthName);
  let yearNum = parseInt(year);
  
  month += direction;
  
  if (month < 0) {
    month = 11;
    yearNum--;
  } else if (month > 11) {
    month = 0;
    yearNum++;
  }
  
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${yearNum}`;
  generateCalendarGrid(month, yearNum);
}

// Set calendar view (month, week, day)
function setCalendarView(view) {
  // Update active button
  document.getElementById('monthViewBtn').classList.remove('active');
  document.getElementById('weekViewBtn').classList.remove('active');
  document.getElementById('dayViewBtn').classList.remove('active');
  document.getElementById(`${view}ViewBtn`).classList.add('active');
  
  // TODO: Implement different calendar views
  // For now, just show month view
  const currentMonthText = document.getElementById('currentMonth').textContent;
  const [monthName, year] = currentMonthText.split(' ');
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames.indexOf(monthName);
  
  generateCalendarGrid(month, parseInt(year));
}

// Show day detail when clicking on a day
function showDayDetail(day, month, year) {
  // TODO: Implement day detail view with appointments
  console.log(`Show detail for ${month + 1}/${day}/${year}`);
}

// Load upcoming appointments
async function loadUpcomingAppointments(doctorId) {
  try {
    // TODO: Replace with actual Supabase API call
    // For now, use mock data
    const appointments = [
      {
        id: 1,
        patientName: 'Alice Johnson',
        date: '2023-06-15',
        time: '09:30 AM',
        reason: 'Annual checkup'
      },
      {
        id: 2,
        patientName: 'Bob Smith',
        date: '2023-06-15',
        time: '11:00 AM',
        reason: 'Follow-up'
      },
      {
        id: 3,
        patientName: 'Carol Davis',
        date: '2023-06-16',
        time: '10:15 AM',
        reason: 'Consultation'
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
          <div class="appointment-title">${appointment.patientName}</div>
          <div class="appointment-meta">${appointment.date} at ${appointment.time} - ${appointment.reason}</div>
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