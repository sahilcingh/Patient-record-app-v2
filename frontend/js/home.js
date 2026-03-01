document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Handle "New Patient" button clicks
    const newPatientButtons = document.querySelectorAll('.btn-new-patient, #btn-sidebar-new');
    newPatientButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = 'new-patient.html';
        });
    });

    // 2. Fetch and display the recent patients on the dashboard
    fetchRecentPatients();
});

// --- RECENT PATIENTS LOGIC ---
async function fetchRecentPatients() {
    const listContainer = document.getElementById('recent-patients-list');
    const token = localStorage.getItem('doctorToken');

    if (!token || !listContainer) return;

    try {
        const response = await fetch('http://localhost:5000/api/patients/recent', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            listContainer.innerHTML = ''; // Clear loading text

            if (data.patients.length === 0) {
                listContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: #9ca3af;">No recent patients found.</div>';
                return;
            }

            // Colors for the avatars
            const avatarThemes = [
                { bg: '#fcd34d', text: '#b45309' }, 
                { bg: '#10b981', text: 'white' },   
                { bg: '#64748b', text: 'white' },   
                { bg: '#f43f5e', text: 'white' }    
            ];

            // Build the HTML for each patient
            data.patients.forEach((patient, index) => {
                const initials = getInitials(patient.PatientName);
                const theme = avatarThemes[index % avatarThemes.length];
                const formattedDate = formatDate(patient.VisitDate);

                // Added an onclick parameter to route to old-patient.html!
                const patientHTML = `
                    <div class="list-item" onclick="window.location.href='old-patient.html?id=${patient.VisitID}'">
                        <div class="profile-col">
                            <div class="avatar" style="background: ${theme.bg}; color: ${theme.text};">
                                ${initials}
                            </div>
                            <div>
                                <div class="item-name">${patient.PatientName}</div>
                                <div class="item-sub">S.No: ${patient.VisitID}</div>
                            </div>
                        </div>
                        <div class="date-col">Last visit<br>${formattedDate}</div>
                    </div>
                `;
                
                listContainer.insertAdjacentHTML('beforeend', patientHTML);
            });
        } else {
            listContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: #ef4444;">Failed to load patients.</div>`;
        }

    } catch (error) {
        console.error("Error fetching patients:", error);
        listContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: #ef4444;">Server connection error.</div>`;
    }
}

// --- HELPER FUNCTIONS ---
function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const suffix = (day % 10 === 1 && day !== 11) ? 'st' : 
                   (day % 10 === 2 && day !== 12) ? 'nd' : 
                   (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

    return `${day}${suffix} ${month}, ${year}`;
}