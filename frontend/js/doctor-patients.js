// Doctor Patients JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const { data: doctor, error } = await supabase
                    .from('doctors')
                    .select('*')
                    .eq('firebase_uid', user.uid)
                    .single();

                if (error) throw error;

                // Load patient statistics
                await loadPatientStats(doctor.id);
                
                // Load patients
                await loadPatients(doctor.id);

                // Setup event listeners
                setupEventListeners();

                // Hide loading state
                document.getElementById('loadingState').style.display = 'none';
            } catch (error) {
                console.error('Error loading doctor data:', error);
                alert('Failed to load patient data. Please try again later.');
            }
        } else {
            window.location.href = 'auth.html?type=doctor';
        }
    });
});

async function loadPatientStats(doctorId) {
    try {
        // Get total patients
        const { count: totalCount } = await supabase
            .from('appointments')
            .select('patient_id', { count: 'exact', distinct: true })
            .eq('doctor_id', doctorId);

        // Get active patients (had appointment in last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const { count: activeCount } = await supabase
            .from('appointments')
            .select('patient_id', { count: 'exact', distinct: true })
            .eq('doctor_id', doctorId)
            .gte('date', threeMonthsAgo.toISOString());

        // Get new patients this month
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const { count: newCount } = await supabase
            .from('appointments')
            .select('patient_id', { count: 'exact', distinct: true })
            .eq('doctor_id', doctorId)
            .gte('date', thisMonth.toISOString());

        // Get follow-ups due
        const { count: followupsCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .eq('requires_followup', true)
            .is('followup_scheduled', false);

        // Update UI
        document.getElementById('totalPatients').textContent = totalCount || 0;
        document.getElementById('activePatients').textContent = activeCount || 0;
        document.getElementById('newPatients').textContent = newCount || 0;
        document.getElementById('followupsDue').textContent = followupsCount || 0;

    } catch (error) {
        console.error('Error loading patient stats:', error);
    }
}

async function loadPatients(doctorId, filters = {}) {
    try {
        document.getElementById('loadingState').style.display = 'flex';
        
        let query = supabase
            .from('appointments')
            .select(`
                patients (
                    id,
                    name,
                    email,
                    phone,
                    dob,
                    gender,
                    medical_history
                )
            `)
            .eq('doctor_id', doctorId);

        // Apply filters
        if (filters.status === 'active') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            query = query.gte('date', threeMonthsAgo.toISOString());
        }

        const { data: appointments, error } = await query;

        if (error) throw error;

        // Get unique patients
        const uniquePatients = [];
        const patientIds = new Set();
        
        appointments.forEach(appointment => {
            if (appointment.patients && !patientIds.has(appointment.patients.id)) {
                patientIds.add(appointment.patients.id);
                uniquePatients.push(appointment.patients);
            }
        });

        displayPatients(uniquePatients);

        // Show/hide empty state
        const emptyState = document.getElementById('emptyState');
        emptyState.style.display = uniquePatients.length === 0 ? 'flex' : 'none';

    } catch (error) {
        console.error('Error loading patients:', error);
    } finally {
        document.getElementById('loadingState').style.display = 'none';
    }
}

function displayPatients(patients) {
    const grid = document.getElementById('patientsGrid');
    grid.innerHTML = '';

    patients.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'profile-card animate-slide-in';
        card.innerHTML = `
            <div class="profile-card-header">
                <div class="profile-card-avatar">👤</div>
                <h3>${patient.name}</h3>
                <p>${patient.email}</p>
            </div>
            <div class="profile-card-body">
                <div class="profile-card-info">
                    <div class="profile-card-info-item">
                        <span class="profile-card-info-label">Phone</span>
                        <span>${patient.phone || 'N/A'}</span>
                    </div>
                    <div class="profile-card-info-item">
                        <span class="profile-card-info-label">Age</span>
                        <span>${calculateAge(patient.dob) || 'N/A'}</span>
                    </div>
                    <div class="profile-card-info-item">
                        <span class="profile-card-info-label">Gender</span>
                        <span>${patient.gender || 'N/A'}</span>
                    </div>
                </div>
                <div class="profile-card-actions">
                    <button class="btn btn-primary" onclick="viewPatient('${patient.id}')">View Details</button>
                    <button class="btn btn-secondary" onclick="scheduleAppointment('${patient.id}')">Schedule</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setupEventListeners() {
    // Search functionality
    let searchTimeout;
    document.getElementById('searchPatients').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.profile-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            });

            // Show/hide empty state
            const visibleCards = document.querySelectorAll('.profile-card[style=""]').length;
            document.getElementById('emptyState').style.display = 
                visibleCards === 0 ? 'flex' : 'none';
        }, 300);
    });

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        const doctorId = getCurrentDoctorId(); // You'll need to implement this
        loadPatients(doctorId, { status: e.target.value });
    });

    // Sort filter
    document.getElementById('sortFilter').addEventListener('change', (e) => {
        const cards = Array.from(document.querySelectorAll('.profile-card'));
        const container = document.getElementById('patientsGrid');
        
        cards.sort((a, b) => {
            const nameA = a.querySelector('h3').textContent;
            const nameB = b.querySelector('h3').textContent;
            return e.target.value === 'name' ? 
                nameA.localeCompare(nameB) : 
                nameB.localeCompare(nameA);
        });

        container.innerHTML = '';
        cards.forEach(card => container.appendChild(card));
    });
}

// Utility functions
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

async function viewPatient(patientId) {
    try {
        const { data: patient, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();

        if (error) throw error;

        // Update modal content
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientEmail').textContent = patient.email;
        document.getElementById('patientPhone').textContent = patient.phone || 'N/A';
        document.getElementById('patientAge').textContent = calculateAge(patient.dob) || 'N/A';
        document.getElementById('patientGender').textContent = patient.gender || 'N/A';
        document.getElementById('patientMedicalHistory').textContent = patient.medical_history || 'No medical history recorded';

        // Show modal
        document.getElementById('patientModal').style.display = 'flex';

        // Load visit history
        await loadVisitHistory(patientId);
    } catch (error) {
        console.error('Error loading patient details:', error);
        alert('Failed to load patient details. Please try again.');
    }
}

function closeModal() {
    document.getElementById('patientModal').style.display = 'none';
}

async function scheduleAppointment(patientId) {
    // Redirect to appointment scheduling page
    window.location.href = `doctor-schedule.html?patient=${patientId}`;
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location.href = '../index.html';
    });
});
