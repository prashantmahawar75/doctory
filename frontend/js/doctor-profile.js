// Doctor Profile JavaScript

// Utility functions
function toggleLoading(show) {
    document.querySelector('.loading').classList.toggle('active', show);
}

function showError(message, error = null) {
    const errorDisplay = document.querySelector('.alert-error');
    if (error) {
        console.error('Error details:', error);
    }
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
    toggleLoading(false);
}

function clearError() {
    const errorDisplay = document.querySelector('.alert-error');
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
    }
}

async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('count', { count: 'exact', head: true });
            
        if (error) {
            showError('Database connection failed', error);
            return false;
        }
        console.log('Database connection successful');
        return true;
    } catch (error) {
        showError('Failed to connect to the database. Please check your internet connection.', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Add loading indicator to DOM
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    document.body.appendChild(loadingIndicator);

    // Add error display
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'alert alert-error';
    errorDisplay.style.display = 'none';
    document.querySelector('.container').prepend(errorDisplay);

    function showError(message) {
        console.error('Error:', message);
        errorDisplay.textContent = `Error: ${message}`;
        errorDisplay.style.display = 'block';
        toggleLoading(false);
    }

    function clearError() {
        errorDisplay.style.display = 'none';
    }

    // Initialize app
    auth.onAuthStateChanged(async (user) => {
        toggleLoading(true);
        clearError();

        try {
            if (!user) {
                console.log('No user session found, redirecting to login...');
                window.location.href = 'auth.html?type=doctor';
                return;
            }

            console.log('User authenticated:', user.email);

            // First check Supabase connection
            const isConnected = await checkSupabaseConnection();
            if (!isConnected) {
                throw new Error('Could not connect to the database. Please check your internet connection.');
            }

            // Get doctor profile from Supabase
            console.log('Fetching doctor profile for user:', user.uid);
            const { data: doctor, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('firebase_uid', user.uid)
                .single();

            if (error) {
                console.error('Error fetching doctor profile:', error);
                throw new Error('Failed to fetch doctor profile');
            }

            if (!doctor) {
                // New user - create profile
                console.log('New user detected, creating profile...');
                const newDoctor = {
                    firebase_uid: user.uid,
                    name: user.displayName || 'New Doctor',
                    email: user.email,
                    created_at: new Date().toISOString()
                };

                const { data: createdDoctor, error: createError } = await supabase
                    .from('doctors')
                    .insert([newDoctor])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating doctor profile:', createError);
                    throw createError;
                }

                // Show onboarding UI for new user
                showOnboardingUI(createdDoctor);
            } else {
                // Existing user - update profile information
                console.log('Existing user detected, loading profile...');
                updateProfileInfo(doctor);
                
                // Get statistics
                await loadStatistics(doctor.id);
                
                // Load upcoming appointments
                await loadUpcomingAppointments(doctor.id);
                
                // Load schedule
                await loadSchedule(doctor.id);
            }
        } catch (error) {
            console.error('Error in profile management:', error);
            setError(error.message || 'Failed to load or create profile. Please try again later.');
        } finally {
            toggleLoading(false);
        }
    });

    // Setup logout functionality
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = '../index.html';
        });
    });
});

async function updateProfileInfo(doctor) {
    console.log('Updating profile with data:', doctor);
    
    if (!doctor) {
        console.error('No doctor data provided to updateProfileInfo');
        return;
    }

    try {
        // Get user email from Firebase Auth
        const user = auth.currentUser;
        const email = user ? user.email : 'Not specified';

        // Update profile header
        const headerElements = {
            'doctorName': `Dr. ${doctor.name}`,
            'doctorSpecialty': doctor.specialty,
            // Don't show license number in header if not available
            'doctorLicense': doctor.license_number ? `License #${doctor.license_number}` : ''
        };

        // Update personal information
        const personalInfoElements = {
            'fullName': doctor.name,
            'email': email,  // Use email from Firebase Auth
            'specialty': doctor.specialty,
            // These fields might not exist in the database yet
            'licenseNumber': doctor.license_number || 'Not specified',
            'experience': doctor.experience || 'Not specified',
            'phone': doctor.phone || 'Not specified'
        };

        // Update all elements and log any missing ones
        [...Object.entries(headerElements), ...Object.entries(personalInfoElements)].forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`Updated ${id} with value:`, value);
            } else {
                console.warn(`Element with id '${id}' not found in the DOM`);
            }
        });

        // Add error notice if profile is incomplete
        const missingFields = [];
        if (!doctor.license_number) missingFields.push('license number');
        if (!doctor.experience) missingFields.push('experience');
        if (!doctor.phone) missingFields.push('phone number');

        if (missingFields.length > 0) {
            const warningElement = document.createElement('div');
            warningElement.className = 'alert alert-warning';
            warningElement.style.marginTop = '20px';
            warningElement.innerHTML = `⚠️ Your profile is incomplete. Please add your ${missingFields.join(', ')}.`;
            
            const personalInfoSection = document.querySelector('.profile-section');
            if (personalInfoSection) {
                personalInfoSection.appendChild(warningElement);
            }
        }

        console.log('Profile information updated successfully');
    } catch (error) {
        console.error('Error updating profile information:', error);
        alert('There was an error updating your profile information. Please refresh the page.');
    }
}

async function loadStatistics(doctorId) {
    try {
        // Get total patients
        const { count: patientsCount } = await supabase
            .from('appointments')
            .select('patient_id', { count: 'exact', distinct: true })
            .eq('doctor_id', doctorId);

        // Get total appointments
        const { count: appointmentsCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId);

        // Get upcoming appointments
        const { count: upcomingCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .gte('date', new Date().toISOString().split('T')[0])
            .eq('status', 'confirmed');

        // Update statistics
        document.getElementById('totalPatients').textContent = patientsCount || 0;
        document.getElementById('totalAppointments').textContent = appointmentsCount || 0;
        document.getElementById('upcomingAppointments').textContent = upcomingCount || 0;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadUpcomingAppointments(doctorId) {
    try {
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patients(name)
            `)
            .eq('doctor_id', doctorId)
            .gte('date', new Date().toISOString().split('T')[0])
            .eq('status', 'confirmed')
            .order('date', { ascending: true })
            .order('time', { ascending: true })
            .limit(5);

        if (error) throw error;

        const appointmentsList = document.getElementById('upcomingAppointmentsList');
        appointmentsList.innerHTML = '';

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>No upcoming appointments</p>';
            return;
        }

        appointments.forEach(appointment => {
            const appointmentElement = document.createElement('div');
            appointmentElement.className = 'appointment-item';
            appointmentElement.innerHTML = `
                <div class="appointment-info">
                    <div class="appointment-title">${appointment.patients.name}</div>
                    <div class="appointment-meta">
                        ${appointment.date} at ${appointment.time}
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-primary" onclick="viewAppointment('${appointment.id}')">View</button>
                </div>
            `;
            appointmentsList.appendChild(appointmentElement);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

async function loadSchedule(doctorId) {
    try {
        const { data: schedule, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('doctor_id', doctorId)
            .eq('date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = '';

        if (schedule.length === 0) {
            timeSlotsContainer.innerHTML = '<p>No schedule set for today</p>';
            return;
        }

        schedule.forEach(slot => {
            const timeSlot = document.createElement('div');
            timeSlot.className = `time-slot ${slot.is_available ? 'available' : 'booked'}`;
            timeSlot.textContent = slot.time;
            timeSlotsContainer.appendChild(timeSlot);
        });
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

function showOnboardingUI(doctor) {
    // Clear main content
    const mainContent = document.querySelector('.profile-content');
    mainContent.innerHTML = `
        <div class="profile-section">
            <h2>Welcome to Doctory! 👋</h2>
            <p>Please complete your profile to get started.</p>
            <form id="onboardingForm" class="profile-form">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" value="${doctor.name}" required>
                </div>
                <div class="form-group">
                    <label for="specialty">Specialty</label>
                    <input type="text" id="specialty" required>
                </div>
                <div class="form-group">
                    <label for="licenseNumber">License Number</label>
                    <input type="text" id="licenseNumber" required>
                </div>
                <div class="form-group">
                    <label for="experience">Years of Experience</label>
                    <input type="number" id="experience" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" required>
                </div>
                <button type="submit" class="btn btn-primary">Complete Profile</button>
            </form>
        </div>
    `;

    // Handle form submission
    document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedDoctor = {
            name: document.getElementById('name').value,
            specialty: document.getElementById('specialty').value,
            license_number: document.getElementById('licenseNumber').value,
            experience: document.getElementById('experience').value,
            phone: document.getElementById('phone').value
        };

        try {
            const { data, error } = await supabase
                .from('doctors')
                .update(updatedDoctor)
                .eq('id', doctor.id)
                .select()
                .single();

            if (error) throw error;

            // Reload page to show complete profile
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
}

async function editProfile() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Get current doctor data
        const { data: doctor, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('firebase_uid', user.uid)
            .single();

        if (error) throw error;

        // Show edit form
        const section = document.querySelector('.profile-section');
        const originalContent = section.innerHTML;
        
        section.innerHTML = `
            <h2>Edit Profile</h2>
            <form id="editProfileForm" class="profile-form">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" value="${doctor.name}" required>
                </div>
                <div class="form-group">
                    <label for="specialty">Specialty</label>
                    <input type="text" id="specialty" value="${doctor.specialty || ''}" required>
                </div>
                <div class="form-group">
                    <label for="licenseNumber">License Number</label>
                    <input type="text" id="licenseNumber" value="${doctor.license_number || ''}" required>
                </div>
                <div class="form-group">
                    <label for="experience">Years of Experience</label>
                    <input type="number" id="experience" value="${doctor.experience || ''}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" value="${doctor.phone || ''}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelEdit('${encodeURIComponent(originalContent)}')">Cancel</button>
                </div>
            </form>
        `;

        // Handle form submission
        document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedDoctor = {
                name: document.getElementById('name').value,
                specialty: document.getElementById('specialty').value,
                license_number: document.getElementById('licenseNumber').value,
                experience: document.getElementById('experience').value,
                phone: document.getElementById('phone').value
            };

            try {
                const { data, error } = await supabase
                    .from('doctors')
                    .update(updatedDoctor)
                    .eq('id', doctor.id)
                    .select()
                    .single();

                if (error) throw error;

                // Reload page to show updated profile
                window.location.reload();
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error in edit profile:', error);
        alert('Failed to load profile data. Please try again.');
    }
}

function cancelEdit(originalContent) {
    const section = document.querySelector('.profile-section');
    section.innerHTML = decodeURIComponent(originalContent);
}

function editSchedule() {
    window.location.href = 'doctor-schedule.html';
}

function viewAppointment(appointmentId) {
    // TODO: Implement view appointment functionality
    alert('View appointment functionality will be implemented soon');
}
