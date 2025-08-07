// Doctor Appointments JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Load doctor's data and appointments
            try {
                const { data: doctor, error } = await supabase
                    .from('doctors')
                    .select('*')
                    .eq('firebase_uid', user.uid)
                    .single();

                if (error) throw error;

                // Load appointments statistics
                await loadAppointmentStats(doctor.id);
                
                // Load appointments
                await loadAppointments(doctor.id);

                // Setup event listeners
                setupEventListeners();
            } catch (error) {
                console.error('Error loading doctor data:', error);
                alert('Failed to load appointments. Please try again later.');
            }
        } else {
            // Redirect to login
            window.location.href = 'auth.html?type=doctor';
        }
    });
});

async function loadAppointmentStats(doctorId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        // Get today's appointments
        const { count: todayCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .eq('date', today);

        // Get upcoming appointments
        const { count: upcomingCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .gte('date', tomorrow)
            .lt('date', weekLater);

        // Get completed appointments this month
        const { count: completedCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .eq('status', 'completed')
            .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        // Get cancellation rate
        const { count: totalCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId);

        const { count: cancelledCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .eq('status', 'cancelled');

        // Update stats in UI
        document.getElementById('todayAppointments').textContent = todayCount || 0;
        document.getElementById('upcomingAppointments').textContent = upcomingCount || 0;
        document.getElementById('completedAppointments').textContent = completedCount || 0;
        document.getElementById('cancellationRate').textContent = 
            totalCount ? Math.round((cancelledCount / totalCount) * 100) + '%' : '0%';

    } catch (error) {
        console.error('Error loading appointment stats:', error);
    }
}

async function loadAppointments(doctorId, filters = {}) {
    try {
        let query = supabase
            .from('appointments')
            .select(`
                *,
                patients (
                    name,
                    phone,
                    medical_history
                )
            `)
            .eq('doctor_id', doctorId);

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.date) {
            const today = new Date().toISOString().split('T')[0];
            switch (filters.date) {
                case 'today':
                    query = query.eq('date', today);
                    break;
                case 'week':
                    const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                    query = query.gte('date', today).lt('date', weekLater);
                    break;
                case 'month':
                    const monthLater = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
                    query = query.gte('date', today).lt('date', monthLater);
                    break;
            }
        }

        // Add sorting
        query = query.order('date', { ascending: true }).order('time', { ascending: true });

        const { data: appointments, error } = await query;

        if (error) throw error;

        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = '';

    appointments.forEach(appointment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="patient-info">
                    <div class="patient-name">${appointment.patients.name}</div>
                    <div class="patient-phone">${appointment.patients.phone || 'No phone'}</div>
                </div>
            </td>
            <td>
                <div class="appointment-datetime">
                    <div class="appointment-date">${formatDate(appointment.date)}</div>
                    <div class="appointment-time">${appointment.time}</div>
                </div>
            </td>
            <td>
                <span class="status-badge status-${appointment.status.toLowerCase()}">
                    ${capitalizeFirst(appointment.status)}
                </span>
            </td>
            <td>${appointment.type || 'Regular checkup'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewAppointment('${appointment.id}')">
                        View
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="updateStatus('${appointment.id}')">
                        Update
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setupEventListeners() {
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        const doctorId = getCurrentDoctorId(); // You'll need to implement this
        loadAppointments(doctorId, { status: e.target.value });
    });

    // Date filter
    document.getElementById('dateFilter').addEventListener('change', (e) => {
        const doctorId = getCurrentDoctorId(); // You'll need to implement this
        loadAppointments(doctorId, { date: e.target.value });
    });

    // Search
    let searchTimeout;
    document.getElementById('searchAppointments').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#appointmentsTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }, 300);
    });
}

// Utility functions
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Modal functions
function viewAppointment(appointmentId) {
    // Implement view appointment modal
}

function updateStatus(appointmentId) {
    // Implement update status modal
}

function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location.href = '../index.html';
    });
});
