// --- APP STATE ---
let students = [];
let attendanceLogs = [];
let isLoggedIn = false;

// Local Storage Keys
const KEY_STUDENTS = 'spoken_english_students';
const KEY_LOGS = 'spoken_english_logs';
const KEY_AUTH = 'spoken_english_auth';

// Mock Data
const MOCK_STUDENTS = [
    { id: '1', name: 'John Doe', roll: 'SE202601', class: 'Level 1' },
    { id: '2', name: 'Sarah Smith', roll: 'SE202602', class: 'Level 1' },
    { id: '3', name: 'Michael Johnson', roll: 'SE202603', class: 'Level 2' },
    { id: '4', name: 'Emily Davis', roll: 'SE202604', class: 'Level 3' },
    { id: '5', name: 'David Wilson', roll: 'SE202605', class: 'Level 4' }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadData();
        setupAuthentication();
        setupDateTime();
        setupNavigation();
        setupStudentManagement();
        setupAttendanceSheet();
        
        // Initial Renders
        if (isLoggedIn) {
            renderDashboard();
            renderStudentsList();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Error initializing application. Please check console.', 'danger');
    }
});

// --- LOAD/SAVE LOCALSTORAGE ---
function loadData() {
    // Load students
    const storedStudents = localStorage.getItem(KEY_STUDENTS);
    if (storedStudents) {
        students = JSON.parse(storedStudents);
    } else {
        students = [...MOCK_STUDENTS];
        saveStudents();
    }

    // Load attendance logs
    const storedLogs = localStorage.getItem(KEY_LOGS);
    if (storedLogs) {
        attendanceLogs = JSON.parse(storedLogs);
    } else {
        attendanceLogs = [];
    }

    // Load auth status
    const storedAuth = localStorage.getItem(KEY_AUTH);
    isLoggedIn = storedAuth === 'true';
}

function saveStudents() {
    localStorage.setItem(KEY_STUDENTS, JSON.stringify(students));
}

function saveLogs() {
    localStorage.setItem(KEY_LOGS, JSON.stringify(attendanceLogs));
}

// --- AUTHENTICATION ---
function setupAuthentication() {
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const logoutBtn = document.getElementById('btn-logout');
    const forgotPwdBtn = document.getElementById('btn-forgot-password');

    // Show/Hide app wrapper depending on auth state
    if (isLoggedIn) {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
    } else {
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            if (email && password) {
                // Mock success for any credentials entered
                isLoggedIn = true;
                localStorage.setItem(KEY_AUTH, 'true');
                
                // Switch Screens
                loginScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                
                showToast(`Welcome back, Ali!`, 'success');
                
                // Render initial views
                renderDashboard();
                renderStudentsList();
            }
        });
    }

    if (forgotPwdBtn) {
        forgotPwdBtn.addEventListener('click', () => {
            showToast('Reset email instructions sent to your inbox!', 'info');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            isLoggedIn = false;
            localStorage.setItem(KEY_AUTH, 'false');
            
            // Switch Screens
            loginScreen.classList.remove('hidden');
            mainApp.classList.add('hidden');
            
            showToast('Successfully signed out.', 'info');
        });
    }
}

// --- GENERAL APP UTILS ---
function setupDateTime() {
    const today = new Date();
    
    // Arabic formatted date in header
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) dateDisplay.textContent = formattedDate;

    // Date input default (YYYY-MM-DD)
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" class="green-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'danger') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" class="red-icon"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" class="gold-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" class="blue-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// --- NAVIGATION ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetTab = link.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active state
    navLinks.forEach(l => l.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // Set active link in sidebar if applicable
    const activeLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Set active tab content
    const targetContent = document.getElementById(`tab-${tabId}`);
    if (targetContent) targetContent.classList.add('active');

    // Trigger renders depending on screen
    if (tabId === 'dashboard') {
        renderDashboard();
    } else if (tabId === 'add-student') {
        renderStudentsList();
    }
}

// Global Nav Handlers
window.backToDashboard = function() {
    switchTab('dashboard');
};

// --- DASHBOARD RENDER ---
function renderDashboard() {
    try {
        // Count students per level
        const countL1 = students.filter(s => s.class === 'Level 1').length;
        const countL2 = students.filter(s => s.class === 'Level 2').length;
        const countL3 = students.filter(s => s.class === 'Level 3').length;
        const countL4 = students.filter(s => s.class === 'Level 4').length;

        // Render counts in dashboard cards
        document.getElementById('count-l1').textContent = countL1;
        document.getElementById('count-l2').textContent = countL2;
        document.getElementById('count-l3').textContent = countL3;
        document.getElementById('count-l4').textContent = countL4;

        // Total roster size label
        document.getElementById('perf-total-students-label').textContent = students.length;
    } catch (e) {
        console.error('Error rendering dashboard:', e);
    }
}

// --- STUDENT MANAGEMENT ---
function setupStudentManagement() {
    const form = document.getElementById('add-student-form');
    const searchInput = document.getElementById('search-students');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const name = document.getElementById('student-name').value.trim();
                const roll = document.getElementById('student-roll').value.trim();
                const level = document.getElementById('student-class').value;

                if (!name || !roll || !level) {
                    showToast('Please fill out all fields.', 'warning');
                    return;
                }

                // Check roll duplicate
                const duplicate = students.some(s => s.roll.toLowerCase() === roll.toLowerCase());
                if (duplicate) {
                    showToast(`Roll number "${roll}" is already used.`, 'danger');
                    return;
                }

                // Create
                const student = {
                    id: Date.now().toString(),
                    name,
                    roll,
                    class: level
                };
                students.push(student);
                saveStudents();
                
                showToast(`Enrolled student "${name}" into ${level}!`, 'success');
                form.reset();
                renderStudentsList();
                renderDashboard();
            } catch (err) {
                console.error(err);
                showToast('Error saving student.', 'danger');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderStudentsList(searchInput.value.trim());
        });
    }
}

function renderStudentsList(query = '') {
    const tbody = document.getElementById('students-list-tbody');
    if (!tbody) return;

    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.roll.toLowerCase().includes(query.toLowerCase()) ||
        s.class.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center empty-table-message">
                    ${query ? 'No matching students found.' : 'No students registered. Fill the form to add.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-outfit" style="font-weight:600; color:var(--color-gold);">${s.roll}</td>
            <td style="font-weight:600;">${s.name}</td>
            <td>${s.class}</td>
            <td class="text-center">
                <button class="btn-icon delete" onclick="removeStudent('${s.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.removeStudent = function(id) {
    try {
        const student = students.find(s => s.id === id);
        if (!student) return;

        if (confirm(`Remove student "${student.name}" from database?`)) {
            students = students.filter(s => s.id !== id);
            saveStudents();
            
            // Clean up logs containing this student
            attendanceLogs.forEach(log => {
                if (log.records[student.roll]) {
                    delete log.records[student.roll];
                    recalculateStats(log);
                }
            });
            saveLogs();

            showToast(`Deleted student "${student.name}".`, 'warning');
            renderStudentsList();
            renderDashboard();
        }
    } catch (e) {
        console.error(e);
    }
};

function recalculateStats(log) {
    const keys = Object.keys(log.records);
    const total = keys.length;
    if (total === 0) {
        log.stats = { present: 0, absent: 0, late: 0, rate: 0 };
        return;
    }

    let present = 0, absent = 0, late = 0;
    keys.forEach(k => {
        const status = log.records[k];
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'late') late++;
    });

    log.stats = {
        present,
        absent,
        late,
        rate: Math.round(((present + late) / total) * 100)
    };
}

// --- ATTENDANCE ACTIONS ---
function setupAttendanceSheet() {
    const bulkPresentBtn = document.getElementById('btn-mark-all-present');
    const bulkAbsentBtn = document.getElementById('btn-mark-all-absent');
    const dateInput = document.getElementById('attendance-date');
    const form = document.getElementById('attendance-sheet-form');

    if (bulkPresentBtn) {
        bulkPresentBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.status-option-input[value="present"]');
            inputs.forEach(input => input.checked = true);
            showToast('All students marked Present.', 'info');
        });
    }

    if (bulkAbsentBtn) {
        bulkAbsentBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.status-option-input[value="absent"]');
            inputs.forEach(input => input.checked = true);
            showToast('All students marked Absent.', 'warning');
        });
    }

    if (dateInput) {
        dateInput.addEventListener('change', () => {
            const level = document.getElementById('attendance-selected-level').value;
            if (level) refreshAttendanceSheet(level);
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const level = document.getElementById('attendance-selected-level').value;
                const dateStr = dateInput.value;

                if (!level || !dateStr) {
                    showToast('Missing details. Please retry.', 'warning');
                    return;
                }

                const classStudents = students.filter(s => s.class === level);
                if (classStudents.length === 0) {
                    showToast('No students enrolled in this level to record attendance.', 'warning');
                    return;
                }

                const records = {};
                let present = 0, absent = 0, late = 0;

                classStudents.forEach(s => {
                    const selected = form.querySelector(`input[name="status-${s.roll}"]:checked`);
                    const status = selected ? selected.value : 'present';
                    records[s.roll] = status;

                    if (status === 'present') present++;
                    else if (status === 'absent') absent++;
                    else if (status === 'late') late++;
                });

                const total = classStudents.length;
                const rate = Math.round(((present + late) / total) * 100);

                const existingIndex = attendanceLogs.findIndex(l => l.date === dateStr && l.level === level);
                const logData = {
                    date: dateStr,
                    level,
                    records,
                    stats: { present, absent, late, rate }
                };

                if (existingIndex !== -1) {
                    attendanceLogs[existingIndex] = logData;
                    showToast(`Updated attendance for ${level} on ${dateStr}!`, 'success');
                } else {
                    attendanceLogs.push(logData);
                    showToast(`Saved attendance for ${level} on ${dateStr}!`, 'success');
                }

                saveLogs();
                switchTab('dashboard');
            } catch (err) {
                console.error(err);
                showToast('Error saving attendance.', 'danger');
            }
        });
    }
}

// Global actions to transition from Dashboard Level Cards
window.openTakeAttendance = function(levelName) {
    switchTab('take-attendance');
    
    // Set level values
    document.getElementById('attendance-level-title').textContent = `Take Attendance: ${levelName}`;
    document.getElementById('attendance-selected-level').value = levelName;

    // Refresh Roster sheet
    refreshAttendanceSheet(levelName);
};

function refreshAttendanceSheet(levelName) {
    const tbody = document.getElementById('attendance-sheet-tbody');
    const dateInput = document.getElementById('attendance-date');
    if (!tbody) return;

    const classStudents = students.filter(s => s.class === levelName);

    if (classStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center empty-table-message">
                    No students currently enrolled in ${levelName}. Add students in the "Add Student" section first.
                </td>
            </tr>
        `;
        return;
    }

    const dateStr = dateInput.value;
    const existingLog = attendanceLogs.find(l => l.date === dateStr && l.level === levelName);

    tbody.innerHTML = '';
    classStudents.forEach(s => {
        let status = 'present'; // default
        if (existingLog && existingLog.records[s.roll]) {
            status = existingLog.records[s.roll];
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-outfit" style="font-weight:600; color:var(--color-gold);">${s.roll}</td>
            <td style="font-weight:600;">${s.name}</td>
            <td>
                <div class="status-options-wrapper">
                    <input type="radio" id="status-${s.roll}-present" name="status-${s.roll}" value="present" class="status-option-input" ${status === 'present' ? 'checked' : ''}>
                    <label for="status-${s.roll}-present" class="status-option-label present">Present</label>

                    <input type="radio" id="status-${s.roll}-late" name="status-${s.roll}" value="late" class="status-option-input" ${status === 'late' ? 'checked' : ''}>
                    <label for="status-${s.roll}-late" class="status-option-label late">Late</label>

                    <input type="radio" id="status-${s.roll}-absent" name="status-${s.roll}" value="absent" class="status-option-input" ${status === 'absent' ? 'checked' : ''}>
                    <label for="status-${s.roll}-absent" class="status-option-label absent">Absent</label>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- VIEW HISTORY LOGS SCREEN ---
window.openViewHistory = function(levelName) {
    switchTab('view-history');
    document.getElementById('history-level-title').textContent = `Class Roster & Logs: ${levelName}`;
    
    renderHistoryDatesList(levelName);
};

function renderHistoryDatesList(levelName) {
    const container = document.getElementById('history-dates-container');
    const placeholderMsg = document.getElementById('detail-placeholder-msg');
    const tableWrapper = document.getElementById('detail-table-wrapper');
    const selectedDateLabel = document.getElementById('detail-selected-date');
    const statsContainer = document.getElementById('detail-stats-badges');

    if (!container) return;

    const classLogs = attendanceLogs.filter(l => l.level === levelName);

    // Initial reset of details view
    placeholderMsg.classList.remove('hidden');
    tableWrapper.classList.add('hidden');
    selectedDateLabel.textContent = 'None';
    statsContainer.innerHTML = '';

    if (classLogs.length === 0) {
        container.innerHTML = '<p class="empty-message">No attendance sessions saved yet for this level.</p>';
        return;
    }

    // Sort logs descending by date
    const sorted = [...classLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = '';
    sorted.forEach(log => {
        const dateObj = new Date(log.date);
        const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'history-date-btn';
        btn.setAttribute('data-date', log.date);
        btn.setAttribute('data-level', log.level);
        btn.innerHTML = `
            <div class="history-date-btn-top">
                <span class="date-text">${displayDate}</span>
                <span class="badge ${log.stats.rate >= 90 ? 'badge-present' : log.stats.rate >= 75 ? 'badge-late' : 'badge-absent'} font-outfit">${log.stats.rate}%</span>
            </div>
            <div style="display:flex; gap:8px; margin-top: 4px;">
                <span class="badge badge-present">P: ${log.stats.present}</span>
                <span class="badge badge-late">L: ${log.stats.late}</span>
                <span class="badge badge-absent">A: ${log.stats.absent}</span>
            </div>
        `;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.history-date-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHistoryLogDetails(log.date, log.level);
        });

        container.appendChild(btn);
    });
}

function renderHistoryLogDetails(dateStr, levelName) {
    const log = attendanceLogs.find(l => l.date === dateStr && l.level === levelName);
    if (!log) return;

    // Set date header
    const dateObj = new Date(log.date);
    document.getElementById('detail-selected-date').textContent = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    // Set stats summary badges
    const statsContainer = document.getElementById('detail-stats-badges');
    statsContainer.innerHTML = `
        <span class="badge badge-present">Att. Rate: ${log.stats.rate}%</span>
        <span class="badge badge-present" style="background-color:rgba(6, 214, 160, 0.1)">Present: ${log.stats.present}</span>
        <span class="badge badge-late" style="background-color:rgba(255, 209, 102, 0.1)">Late: ${log.stats.late}</span>
        <span class="badge badge-absent" style="background-color:rgba(230, 57, 70, 0.1)">Absent: ${log.stats.absent}</span>
    `;

    // Render roster statuses
    const tbody = document.getElementById('history-detail-tbody');
    tbody.innerHTML = '';

    const classStudents = students.filter(s => s.class === levelName);
    if (classStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center empty-table-message">No student data.</td></tr>';
    } else {
        classStudents.forEach(s => {
            const status = log.records[s.roll] || 'absent';
            let label = 'Absent';
            let badgeClass = 'badge-absent';

            if (status === 'present') {
                label = 'Present';
                badgeClass = 'badge-present';
            } else if (status === 'late') {
                label = 'Late';
                badgeClass = 'badge-late';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-outfit" style="font-weight:600; color:var(--color-gold);">${s.roll}</td>
                <td style="font-weight:600;">${s.name}</td>
                <td class="text-center">
                    <span class="badge ${badgeClass}">${label}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Toggle panels
    document.getElementById('detail-placeholder-msg').classList.add('hidden');
    document.getElementById('detail-table-wrapper').classList.remove('hidden');
}
