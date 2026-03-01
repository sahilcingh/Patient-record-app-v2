// js/layout.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SECURITY CHECK ---
    const token = localStorage.getItem('doctorToken');
    if (!token) {
        window.location.href = 'index.html';
        return; 
    }

    // --- 2. CUSTOM LOGOUT MODAL ---
    const logoutBtn = document.querySelector('.user-profile-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', () => logoutModal.classList.remove('hidden'));
        cancelLogoutBtn.addEventListener('click', () => logoutModal.classList.add('hidden'));
        confirmLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('doctorToken');
            window.location.href = 'index.html';
        });
    }

   // --- 3. UNIVERSAL LIVE SEARCH LOGIC ---
    // 🚨 BULLETPROOF FIX: Finds ANY input box that has the word "Search" inside its placeholder!
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const searchContainer = searchInput ? searchInput.parentElement : null;
    
    if (searchInput && searchContainer) {
        
        console.log("✅ Search Bar Successfully Connected!"); // This will show in F12 to prove it works
        
        searchContainer.style.position = 'relative';

        // Create the dropdown container dynamically
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        // Force the dropdown to be full width of the search container
        dropdown.style.width = '100%';
        searchContainer.appendChild(dropdown);

        // Create the Visit History Modal dynamically
        const historyModal = document.createElement('div');
        historyModal.className = 'modal-overlay hidden';
        historyModal.innerHTML = `
            <div class="modal-content modal-content-wide">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.25rem;">Visit History</h3>
                    <button id="close-history-btn" style="background:none; border:none; font-size: 1.5rem; cursor:pointer; color: #9ca3af;">&times;</button>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem;" id="history-patient-name"></p>
                <div style="max-height: 300px; overflow-y: auto;">
                    <table class="visits-table">
                        <thead><tr><th>Visit Date</th><th>S.No (ID)</th><th>Action</th></tr></thead>
                        <tbody id="history-table-body"></tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(historyModal);

        // Close history modal listener
        document.getElementById('close-history-btn').addEventListener('click', () => {
            historyModal.classList.add('hidden');
        });

        // Trigger search when user TYPES
        let timeout = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            
            // Only search if they typed at least 2 letters
            if (query.length < 2) {
                dropdown.classList.remove('active');
                return;
            }

            // Wait 300ms after they stop typing before hitting the database
            timeout = setTimeout(async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/patients/search?q=${query}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();

                    dropdown.innerHTML = ''; // Clear old results

                    if (data.success && data.patients.length > 0) {
                        data.patients.forEach(patient => {
                            const item = document.createElement('div');
                            item.className = 'search-item';
                            item.innerHTML = `
                                <div>
                                    <div class="search-name">${patient.PatientName}</div>
                                    <div class="search-sub">Father: ${patient.FatherName || 'N/A'}</div>
                                </div>
                                <div class="search-sub" style="font-weight:600; color:var(--primary);">${patient.Mobile}</div>
                            `;
                            
                            // When a patient name in the dropdown is clicked
                            item.addEventListener('click', async () => {
                                dropdown.classList.remove('active');
                                searchInput.value = patient.PatientName;
                                
                                try {
                                    // Fetch their visit history
                                    const histRes = await fetch(`http://localhost:5000/api/patients/visits?name=${encodeURIComponent(patient.PatientName)}&mobile=${encodeURIComponent(patient.Mobile)}`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const histData = await histRes.json();
                                    
                                    // Update modal UI
                                    document.getElementById('history-patient-name').innerText = `${patient.PatientName} | Ph: ${patient.Mobile}`;
                                    const tbody = document.getElementById('history-table-body');
                                    tbody.innerHTML = '';

                                    if(histData.success) {
                                        histData.visits.forEach(visit => {
                                            const d = new Date(visit.VisitDate);
                                            const formattedDate = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
                                            
                                            const tr = document.createElement('tr');
                                            tr.className = 'clickable-row';
                                            tr.innerHTML = `
                                                <td>${formattedDate}</td>
                                                <td>#${visit.VisitID}</td>
                                                <td style="color: var(--primary); font-weight: 600;">Open &rarr;</td>
                                            `;
                                            
                                            // Click a specific visit row to go to the Old Patient page
                                            tr.addEventListener('click', () => {
                                                window.location.href = `old-patient.html?id=${visit.VisitID}`;
                                            });
                                            tbody.appendChild(tr);
                                        });
                                    }
                                    // Show the modal!
                                    historyModal.classList.remove('hidden');
                                } catch (err) {
                                    console.error("History fetch error:", err);
                                }
                            });
                            dropdown.appendChild(item);
                        });
                        dropdown.classList.add('active');
                    } else {
                        dropdown.innerHTML = `<div class="search-item"><div class="search-sub">No patients found.</div></div>`;
                        dropdown.classList.add('active');
                    }
                } catch (error) {
                    console.error("Search error:", error);
                }
            }, 300);
        });

        // Hide dropdown if clicked outside the search bar
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    } else {
        console.error("❌ Search Bar NOT Found! Ensure your input has placeholder='Search...'");
    }
});