// Doctor Schedule Management Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('Doctor logged in:', user.uid);
      loadDoctorData(user.uid);
      initializeScheduleCalendar();
      setupEventListeners();
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
      specialty: 'Cardiology'
    };

    // Update UI with doctor data
    document.getElementById('doctorName').textContent = doctorData.name;
    document.getElementById('doctorSpecialty').textContent = doctorData.specialty;
  } catch (error) {
    console.error('Error loading doctor data:', error);
  }
}

// Initialize schedule calendar
function initializeScheduleCalendar() {
  const currentDate = new Date();
  const currentWeek = getWeekDates(currentDate);
  
  // Update week title
  updateWeekTitle(currentWeek.start, currentWeek.end);
  
  // Generate week schedule
  generateWeekSchedule(currentWeek.dates);
  
  // Set today's date as default for slot date input
  document.getElementById('slotDate').valueAsDate = currentDate;
  
  // Add event listeners for navigation
  document.getElementById('prevWeek').addEventListener('click', () => {
    navigateWeek(-1);
  });
  
  document.getElementById('nextWeek').addEventListener('click', () => {
    navigateWeek(1);
  });
}

// Setup event listeners for schedule management
function setupEventListeners() {
  // Set regular hours button
  document.getElementById('setRegularHoursBtn').addEventListener('click', () => {
    document.getElementById('regularHoursModal').style.display = 'block';
  });
  
  // Close regular hours modal
  document.getElementById('closeRegularHoursModal').addEventListener('click', () => {
    document.getElementById('regularHoursModal').style.display = 'none';
  });
  
  // Regular hours form submission
  document.getElementById('regularHoursForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveRegularHours();
  });
  
  // Block time off button
  document.getElementById('blockTimeOffBtn').addEventListener('click', () => {
    blockTimeOff();
  });
  
  // Clear schedule button
  document.getElementById('clearScheduleBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your schedule? This will remove all time slots.')) {
      clearSchedule();
    }
  });
  
  // Add time slot form submission
  document.getElementById('addTimeSlotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addTimeSlots();
  });
  
  // Repeat options change
  document.getElementById('repeatOptions').addEventListener('change', (e) => {
    const repeatUntilGroup = document.getElementById('repeatUntilGroup');
    if (e.target.value === 'none') {
      repeatUntilGroup.style.display = 'none';
    } else {
      repeatUntilGroup.style.display = 'block';
    }
  });
  
  // Date range apply button
  document.getElementById('applyDateRangeBtn').addEventListener('click', () => {
    applyDateRange();
  });
  
  // Calendar view options
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

// Get dates for the week containing the given date
function getWeekDates(date) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const diff = date.getDate() - day;
  
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    weekDates.push(currentDate);
  }
  
  return {
    start: weekStart,
    end: weekEnd,
    dates: weekDates
  };
}

// Update week title
function updateWeekTitle(startDate, endDate) {
  const options = { month: 'long', day: 'numeric' };
  const startFormatted = startDate.toLocaleDateString('en-US', options);
  const endFormatted = endDate.toLocaleDateString('en-US', options);
  const year = startDate.getFullYear();
  
  document.getElementById('currentWeek').textContent = `Week of ${startFormatted} - ${endFormatted}, ${year}`;
}

// Generate week schedule
function generateWeekSchedule(weekDates) {
  const weekSchedule = document.getElementById('weekSchedule');
  weekSchedule.innerHTML = '';
  
  // Create schedule header
  const scheduleHeader = document.createElement('div');
  scheduleHeader.className = 'schedule-header';
  
  // Add time column header
  const timeHeader = document.createElement('div');
  timeHeader.className = 'time-header';
  timeHeader.textContent = 'Time';
  scheduleHeader.appendChild(timeHeader);
  
  // Add day column headers
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  weekDates.forEach((date, index) => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    
    const dayName = document.createElement('div');
    dayName.className = 'day-name';
    dayName.textContent = dayNames[index];
    
    const dayDate = document.createElement('div');
    dayDate.className = 'day-date';
    dayDate.textContent = date.getDate();
    
    // Highlight current day
    const today = new Date();
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      dayHeader.classList.add('today');
    }
    
    dayHeader.appendChild(dayName);
    dayHeader.appendChild(dayDate);
    scheduleHeader.appendChild(dayHeader);
  });
  
  weekSchedule.appendChild(scheduleHeader);
  
  // Create time slots
  const startHour = 8; // 8 AM
  const endHour = 18; // 6 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    const timeRow = document.createElement('div');
    timeRow.className = 'time-row';
    
    // Add time label
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    timeLabel.textContent = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
    timeRow.appendChild(timeLabel);
    
    // Add slots for each day
    weekDates.forEach(date => {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      
      // Check if slot is available (would be replaced with actual data)
      const isAvailable = Math.random() > 0.3;
      if (isAvailable) {
        slot.classList.add('available');
        slot.textContent = 'Available';
      } else {
        slot.classList.add('booked');
        slot.textContent = 'Booked';
      }
      
      // Add click event to manage slot
      slot.addEventListener('click', () => {
        if (isAvailable) {
          manageTimeSlot(date, hour);
        }
      });
      
      timeRow.appendChild(slot);
    });
    
    weekSchedule.appendChild(timeRow);
  }
}

// Navigate to previous or next week
function navigateWeek(direction) {
  const currentWeekText = document.getElementById('currentWeek').textContent;
  const weekStartStr = currentWeekText.match(/Week of ([^-]+)/)[1].trim();
  
  // Parse the start date
  const [month, day] = weekStartStr.split(' ');
  const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month);
  const year = parseInt(currentWeekText.match(/(\d{4})/)[1]);
  
  const startDate = new Date(year, monthIndex, parseInt(day));
  startDate.setDate(startDate.getDate() + (direction * 7));
  
  const newWeek = getWeekDates(startDate);
  updateWeekTitle(newWeek.start, newWeek.end);
  generateWeekSchedule(newWeek.dates);
}

// Set calendar view (month, week, day)
function setCalendarView(view) {
  // Update active button
  document.getElementById('monthViewBtn').classList.remove('active');
  document.getElementById('weekViewBtn').classList.remove('active');
  document.getElementById('dayViewBtn').classList.remove('active');
  document.getElementById(`${view}ViewBtn`).classList.add('active');
  
  // TODO: Implement different calendar views
  // For now, just show week view
  const currentDate = new Date();
  const currentWeek = getWeekDates(currentDate);
  updateWeekTitle(currentWeek.start, currentWeek.end);
  generateWeekSchedule(currentWeek.dates);
}

// Manage time slot
function manageTimeSlot(date, hour) {
  // Format date and time for the form
  const formattedDate = date.toISOString().split('T')[0];
  const formattedStartTime = `${hour.toString().padStart(2, '0')}:00`;
  const formattedEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
  
  // Set form values
  document.getElementById('slotDate').value = formattedDate;
  document.getElementById('startTime').value = formattedStartTime;
  document.getElementById('endTime').value = formattedEndTime;
  
  // Scroll to the form
  document.querySelector('.time-slot-editor').scrollIntoView({ behavior: 'smooth' });
}

// Save regular hours
function saveRegularHours() {
  // Get form values
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const regularHours = {};
  
  weekdays.forEach(day => {
    const enabled = document.getElementById(`${day}Enabled`).checked;
    if (enabled) {
      regularHours[day] = {
        start: document.getElementById(`${day}Start`).value,
        end: document.getElementById(`${day}End`).value
      };
    }
  });
  
  const slotDuration = document.getElementById('slotDurationRegular').value;
  const effectiveDate = document.getElementById('effectiveDate').value;
  
  // TODO: Save regular hours to Supabase
  console.log('Regular hours:', regularHours);
  console.log('Slot duration:', slotDuration);
  console.log('Effective date:', effectiveDate);
  
  // Close modal
  document.getElementById('regularHoursModal').style.display = 'none';
  
  // Show success message
  alert('Regular hours saved successfully!');
  
  // Refresh schedule
  const currentDate = new Date();
  const currentWeek = getWeekDates(currentDate);
  generateWeekSchedule(currentWeek.dates);
}

// Block time off
function blockTimeOff() {
  // TODO: Implement block time off functionality
  alert('This feature is not yet implemented.');
}

// Clear schedule
function clearSchedule() {
  // TODO: Implement clear schedule functionality
  console.log('Clearing schedule...');
  
  // Refresh schedule
  const currentDate = new Date();
  const currentWeek = getWeekDates(currentDate);
  generateWeekSchedule(currentWeek.dates);
  
  alert('Schedule cleared successfully!');
}

// Add time slots
function addTimeSlots() {
  // Get form values
  const slotDate = document.getElementById('slotDate').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const slotDuration = document.getElementById('slotDuration').value;
  const repeatOption = document.getElementById('repeatOptions').value;
  const repeatUntil = document.getElementById('repeatUntil').value;
  const slotNotes = document.getElementById('slotNotes').value;
  
  // TODO: Save time slots to Supabase
  console.log('Adding time slots:');
  console.log('Date:', slotDate);
  console.log('Time:', startTime, 'to', endTime);
  console.log('Duration:', slotDuration, 'minutes');
  console.log('Repeat:', repeatOption);
  if (repeatOption !== 'none') {
    console.log('Repeat until:', repeatUntil);
  }
  console.log('Notes:', slotNotes);
  
  // Show success message
  alert('Time slots added successfully!');
  
  // Refresh schedule
  const currentDate = new Date();
  const currentWeek = getWeekDates(currentDate);
  generateWeekSchedule(currentWeek.dates);
  
  // Reset form
  document.getElementById('addTimeSlotForm').reset();
  document.getElementById('slotDate').valueAsDate = currentDate;
  document.getElementById('repeatUntilGroup').style.display = 'none';
}

// Apply date range
function applyDateRange() {
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(document.getElementById('endDate').value);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    alert('Please select valid start and end dates.');
    return;
  }
  
  if (startDate > endDate) {
    alert('Start date must be before end date.');
    return;
  }
  
  // Update week view to show the selected start date's week
  const newWeek = getWeekDates(startDate);
  updateWeekTitle(newWeek.start, newWeek.end);
  generateWeekSchedule(newWeek.dates);
}