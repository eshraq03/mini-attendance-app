// --- APP STATE MANAGEMENT ---
let students = [];
let attendanceLogs = [];

// Local Storage Keys
const STORAGE_KEY_STUDENTS = 'attendance_app_students';
const STORAGE_KEY_LOGS = 'attendance_app_logs';

// Mock Data to initialize if empty
const MOCK_STUDENTS = [
    { id: '1', name: 'أحمد عبد الله الفارس', roll: 'ST202601', class: 'المستوى الأول' },
    { id: '2', name: 'سارة عمر الخطيب', roll: 'ST202602', class: 'المستوى الأول' },
    { id: '3', name: 'محمد علي منصور', roll: 'ST202603', class: 'المستوى الثاني' },
    { id: '4', name: 'فاطمة حسن اليوسف', roll: 'ST202604', class: 'المستوى الثالث' },
    { id: '5', name: 'خالد وليد النجار', roll: 'ST202605', class: 'المستوى الرابع' }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadData();
        setupDateTime();
        setupTabNavigation();
        setupStudentActions();
        setupAttendanceActions();
        setupHistoryActions();
        
        // Initial render
        renderDashboard();
        renderStudentsList();
        initAttendanceSheet();
        renderHistoryList();
        
        showToast('مرحباً بك في نظام الحضور الذكي! تم تحميل البيانات.', 'info');
    } catch (error) {
        console.error('Error during application initialization:', error);
        showToast('حدث خطأ أثناء تحميل التطبيق. يرجى مراجعة سجل المطور.', 'danger');
    }
});

// --- DATA UTILITIES ---
function loadData() {
    // Load Students
    const storedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (storedStudents) {
        students = JSON.parse(storedStudents);
    } else {
        students = [...MOCK_STUDENTS];
        saveStudentsToStorage();
    }

    // Load Attendance Logs
    const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    if (storedLogs) {
        attendanceLogs = JSON.parse(storedLogs);
    } else {
        attendanceLogs = [];
    }
}

function saveStudentsToStorage() {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
}

function saveLogsToStorage() {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(attendanceLogs));
}

// Set today's date in header & date picker input
function setupDateTime() {
    const today = new Date();
    
    // Arabic formatted date in header
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('ar-EG', dateOptions);
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) dateDisplay.textContent = formattedDate;

    // Date input default (YYYY-MM-DD in local time)
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set icons based on toast type
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

    // Slide out and remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// --- NAV NAVIGATION ---
function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetTab = link.getAttribute('data-tab');
            
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            link.classList.add('active');
            const targetEl = document.getElementById(`tab-${targetTab}`);
            if (targetEl) targetEl.classList.add('active');
            
            // Refresh content if switching tabs
            if (targetTab === 'dashboard') {
                renderDashboard();
            } else if (targetTab === 'log-attendance') {
                initAttendanceSheet();
            } else if (targetTab === 'history') {
                renderHistoryList();
            }
        });
    });

    // Quick action button on dashboard
    const quickLogBtn = document.getElementById('btn-quick-log');
    if (quickLogBtn) {
        quickLogBtn.addEventListener('click', () => {
            const attNavLink = document.getElementById('nav-log-attendance');
            if (attNavLink) attNavLink.click();
        });
    }
}

// --- DASHBOARD SCREEN LOGIC ---
function renderDashboard() {
    try {
        // Compute stats for today/latest logs
        const totalStudents = students.length;
        document.getElementById('stat-total-count').textContent = totalStudents;

        // Get latest attendance log
        const todayDateStr = document.getElementById('attendance-date').value;
        const latestLog = attendanceLogs.find(log => log.date === todayDateStr) || 
                          (attendanceLogs.length > 0 ? attendanceLogs[0] : null); // Fallback to latest

        const rateEl = document.getElementById('stat-attendance-percentage');
        const presentEl = document.getElementById('stat-present-count');
        const absentEl = document.getElementById('stat-absent-count');

        if (latestLog) {
            rateEl.textContent = `${latestLog.stats.rate}%`;
            presentEl.textContent = latestLog.stats.present;
            absentEl.textContent = latestLog.stats.absent;
            
            // Highlight dashboard panels depending on status
            const cardRate = document.getElementById('card-attendance-rate');
            if (latestLog.stats.rate >= 90) {
                cardRate.style.borderTop = '3px solid var(--color-green)';
            } else if (latestLog.stats.rate >= 75) {
                cardRate.style.borderTop = '3px solid var(--color-gold)';
            } else {
                cardRate.style.borderTop = '3px solid var(--color-red)';
            }
        } else {
            rateEl.textContent = '0%';
            presentEl.textContent = '0';
            absentEl.textContent = '0';
            document.getElementById('card-attendance-rate').style.borderTop = 'none';
        }

        // Render Recent Logs Summary Table
        const recentLogsContainer = document.getElementById('recent-logs-container');
        if (!recentLogsContainer) return;

        if (attendanceLogs.length === 0) {
            recentLogsContainer.innerHTML = '<p class="empty-message">لا توجد سجلات حضور مسجلة بعد.</p>';
            return;
        }

        // Sort latest logs (descending by date)
        const sortedLogs = [...attendanceLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        
        recentLogsContainer.innerHTML = '';
        sortedLogs.forEach(log => {
            // Format log date for display
            const logDate = new Date(log.date);
            const dateStr = logDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
            
            const logItem = document.createElement('div');
            logItem.className = 'recent-log-item';
            logItem.innerHTML = `
                <div class="log-date-label">${dateStr}</div>
                <div class="log-stats-summary">
                    <span class="badge badge-present">حاضر: ${log.stats.present}</span>
                    <span class="badge badge-absent">غائب: ${log.stats.absent}</span>
                    <span class="badge badge-late">متأخر: ${log.stats.late}</span>
                </div>
            `;
            
            // Click to view history detail directly
            logItem.style.cursor = 'pointer';
            logItem.addEventListener('click', () => {
                const historyNavLink = document.getElementById('nav-history');
                if (historyNavLink) {
                    historyNavLink.click();
                    setTimeout(() => {
                        viewHistoryDetail(log.date);
                    }, 50);
                }
            });

            recentLogsContainer.appendChild(logItem);
        });

    } catch (e) {
        console.error('Error rendering dashboard:', e);
    }
}

// --- STUDENT MANAGEMENT SCREEN ---
function setupStudentActions() {
    const form = document.getElementById('add-student-form');
    const searchInput = document.getElementById('search-students');
    const cancelEditBtn = document.getElementById('btn-cancel-edit');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const studentIdInput = document.getElementById('edit-student-id').value;
                const name = document.getElementById('student-name').value.trim();
                const roll = document.getElementById('student-roll').value.trim();
                const studentClass = document.getElementById('student-class').value;

                if (!name || !roll || !studentClass) {
                    showToast('يرجى ملء جميع الحقول المطلوبة.', 'warning');
                    return;
                }

                // Check duplicate roll number (exclude current edited student)
                const isDuplicate = students.some(s => s.roll.toLowerCase() === roll.toLowerCase() && s.id !== studentIdInput);
                if (isDuplicate) {
                    showToast(`رقم الطالب التعريفي "${roll}" مستخدم بالفعل لمسجل آخر.`, 'danger');
                    return;
                }

                if (studentIdInput) {
                    // Update Mode
                    const index = students.findIndex(s => s.id === studentIdInput);
                    if (index !== -1) {
                        students[index].name = name;
                        students[index].roll = roll;
                        students[index].class = studentClass;
                        showToast(`تم تحديث بيانات الطالب "${name}" بنجاح.`, 'success');
                    }
                } else {
                    // Create Mode
                    const newStudent = {
                        id: Date.now().toString(),
                        name,
                        roll,
                        class: studentClass
                    };
                    students.push(newStudent);
                    showToast(`تم إضافة الطالب "${name}" بنجاح.`, 'success');
                }

                saveStudentsToStorage();
                resetStudentForm();
                renderStudentsList();
            } catch (err) {
                console.error('Error saving student:', err);
                showToast('حدث خطأ أثناء حفظ الطالب.', 'danger');
            }
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            resetStudentForm();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderStudentsList(searchInput.value.trim());
        });
    }
}

function resetStudentForm() {
    const form = document.getElementById('add-student-form');
    if (form) form.reset();
    
    document.getElementById('edit-student-id').value = '';
    document.getElementById('form-action-title').textContent = 'إضافة طالب جديد';
    document.getElementById('btn-save-student').querySelector('span').textContent = 'حفظ بيانات الطالب';
    document.getElementById('btn-cancel-edit').classList.add('hidden');
}

function renderStudentsList(filterQuery = '') {
    const tbody = document.getElementById('students-list-tbody');
    if (!tbody) return;

    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        student.roll.toLowerCase().includes(filterQuery.toLowerCase()) ||
        student.class.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center empty-table-message">
                    ${filterQuery ? 'لا توجد نتائج تطابق بحثك.' : 'لم يتم إضافة أي طالب بعد. أضف طلاباً من النموذج.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-outfit" style="font-weight: 600; color: var(--color-gold);">${student.roll}</td>
            <td style="font-weight: 600;">${student.name}</td>
            <td>${student.class}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" onclick="editStudent('${student.id}')" title="تعديل">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteStudent('${student.id}')" title="حذف">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Global functions for inline table button actions
window.editStudent = function(id) {
    try {
        const student = students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('edit-student-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-roll').value = student.roll;
        document.getElementById('student-class').value = student.class;

        document.getElementById('form-action-title').textContent = 'تعديل بيانات الطالب';
        document.getElementById('btn-save-student').querySelector('span').textContent = 'تعديل البيانات';
        document.getElementById('btn-cancel-edit').classList.remove('hidden');

        // Scroll to form on small screens
        document.getElementById('add-student-form').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        console.error('Error preparing student edit:', e);
    }
};

window.deleteStudent = function(id) {
    try {
        const student = students.find(s => s.id === id);
        if (!student) return;

        if (confirm(`هل أنت متأكد من حذف الطالب "${student.name}" من النظام؟ هذا سيحذف سجلاته السابقة أيضاً.`)) {
            // Delete from student list
            students = students.filter(s => s.id !== id);
            saveStudentsToStorage();
            
            // Delete from all saved attendance logs
            attendanceLogs.forEach(log => {
                if (log.records[student.roll]) {
                    delete log.records[student.roll];
                    // Recalculate stats for the log
                    recalculateLogStats(log);
                }
            });
            saveLogsToStorage();

            showToast(`تم حذف الطالب "${student.name}" بنجاح.`, 'warning');
            renderStudentsList();
            renderDashboard();
        }
    } catch (e) {
        console.error('Error deleting student:', e);
    }
};

function recalculateLogStats(log) {
    const rolls = Object.keys(log.records);
    const total = rolls.length;
    if (total === 0) {
        log.stats = { present: 0, absent: 0, late: 0, rate: 0 };
        return;
    }

    let present = 0, absent = 0, late = 0;
    rolls.forEach(r => {
        if (log.records[r] === 'present') present++;
        else if (log.records[r] === 'absent') absent++;
        else if (log.records[r] === 'late') late++;
    });

    log.stats = {
        present,
        absent,
        late,
        rate: Math.round(((present + late) / total) * 100)
    };
}

// --- ATTENDANCE LOGGING SHEET ---
function setupAttendanceActions() {
    const dateInput = document.getElementById('attendance-date');
    const form = document.getElementById('attendance-sheet-form');
    const bulkPresentBtn = document.getElementById('btn-mark-all-present');
    const bulkAbsentBtn = document.getElementById('btn-mark-all-absent');

    if (dateInput) {
        dateInput.addEventListener('change', () => {
            initAttendanceSheet();
        });
    }

    if (bulkPresentBtn) {
        bulkPresentBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.status-option-input[value="present"]');
            inputs.forEach(input => input.checked = true);
            showToast('تم تعليم جميع الطلاب كـ حضور في الكشف الحالي.', 'info');
        });
    }

    if (bulkAbsentBtn) {
        bulkAbsentBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.status-option-input[value="absent"]');
            inputs.forEach(input => input.checked = true);
            showToast('تم تعليم جميع الطلاب كـ غياب في الكشف الحالي.', 'warning');
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const dateStr = dateInput.value;
                if (!dateStr) {
                    showToast('الرجاء اختيار تاريخ صالح.', 'warning');
                    return;
                }

                if (students.length === 0) {
                    showToast('لا يوجد طلاب لتسجيل حضورهم. يرجى إضافة طلاب أولاً.', 'warning');
                    return;
                }

                const records = {};
                let present = 0;
                let absent = 0;
                let late = 0;

                // Collect radio values
                students.forEach(student => {
                    const selected = form.querySelector(`input[name="status-${student.roll}"]:checked`);
                    const status = selected ? selected.value : 'present'; // Default
                    records[student.roll] = status;

                    if (status === 'present') present++;
                    else if (status === 'absent') absent++;
                    else if (status === 'late') late++;
                });

                const total = students.length;
                // Attendance rate: present + late divided by total
                const rate = Math.round(((present + late) / total) * 100);

                const existingLogIndex = attendanceLogs.findIndex(log => log.date === dateStr);
                const logData = {
                    date: dateStr,
                    records,
                    stats: { present, absent, late, rate }
                };

                if (existingLogIndex !== -1) {
                    attendanceLogs[existingLogIndex] = logData;
                    showToast(`تم تحديث كشف الحضور لتاريخ ${dateStr} بنجاح.`, 'success');
                } else {
                    attendanceLogs.push(logData);
                    showToast(`تم حفظ كشف الحضور لتاريخ ${dateStr} بنجاح.`, 'success');
                }

                saveLogsToStorage();
                renderDashboard();
                renderHistoryList();
            } catch (err) {
                console.error('Error saving attendance:', err);
                showToast('حدث خطأ أثناء حفظ كشف الحضور.', 'danger');
            }
        });
    }
}

// Global functions for attendance page
window.initAttendanceSheet = function() {
    const tbody = document.getElementById('attendance-sheet-tbody');
    const submitBtn = document.getElementById('btn-submit-attendance');
    const dateInput = document.getElementById('attendance-date');
    
    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center empty-table-message">الرجاء إضافة بعض الطلاب أولاً في قسم إدارة الطلاب لكي تتمكن من تحضيرهم.</td>
            </tr>
        `;
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    if (submitBtn) submitBtn.disabled = false;

    const dateStr = dateInput.value;
    // Find if there is already saved attendance for this date
    const existingLog = attendanceLogs.find(log => log.date === dateStr);

    tbody.innerHTML = '';
    students.forEach(student => {
        // Determine selected status
        let selectedStatus = 'present'; // Default
        if (existingLog && existingLog.records[student.roll]) {
            selectedStatus = existingLog.records[student.roll];
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-outfit" style="font-weight: 600; color: var(--color-gold);">${student.roll}</td>
            <td style="font-weight: 600;">${student.name}</td>
            <td>${student.class}</td>
            <td>
                <div class="status-options-wrapper">
                    
                    <input type="radio" id="status-${student.roll}-present" name="status-${student.roll}" value="present" class="status-option-input" ${selectedStatus === 'present' ? 'checked' : ''}>
                    <label for="status-${student.roll}-present" class="status-option-label present">حاضر</label>
                    
                    <input type="radio" id="status-${student.roll}-late" name="status-${student.roll}" value="late" class="status-option-input" ${selectedStatus === 'late' ? 'checked' : ''}>
                    <label for="status-${student.roll}-late" class="status-option-label late">متأخر</label>
                    
                    <input type="radio" id="status-${student.roll}-absent" name="status-${student.roll}" value="absent" class="status-option-input" ${selectedStatus === 'absent' ? 'checked' : ''}>
                    <label for="status-${student.roll}-absent" class="status-option-label absent">غائب</label>
                    
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- HISTORY SCREEN LOGIC ---
function setupHistoryActions() {
    // No special event listeners needed, but container acts dynamically
}

window.renderHistoryList = function() {
    const container = document.getElementById('history-dates-container');
    if (!container) return;

    if (attendanceLogs.length === 0) {
        container.innerHTML = '<p class="empty-message">لا توجد كشوفات مسجلة سابقاً في النظام.</p>';
        document.getElementById('detail-placeholder-msg').classList.remove('hidden');
        document.getElementById('detail-table-wrapper').classList.add('hidden');
        document.getElementById('detail-selected-date').textContent = 'لم يحدد بعد';
        document.getElementById('detail-stats-badges').innerHTML = '';
        return;
    }

    // Sort by date (descending)
    const sorted = [...attendanceLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = '';
    sorted.forEach(log => {
        const logDate = new Date(log.date);
        const dateStr = logDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'history-date-btn';
        btn.setAttribute('data-date', log.date);
        btn.innerHTML = `
            <div class="history-date-btn-top">
                <span class="date-text">${dateStr}</span>
                <span class="badge ${log.stats.rate >= 90 ? 'badge-present' : log.stats.rate >= 75 ? 'badge-late' : 'badge-absent'} font-outfit">${log.stats.rate}%</span>
            </div>
            <div class="log-stats-summary" style="margin-top: 4px;">
                <span class="badge badge-present">حاضر: ${log.stats.present}</span>
                <span class="badge badge-absent">غائب: ${log.stats.absent}</span>
                <span class="badge badge-late">متأخر: ${log.stats.late}</span>
            </div>
        `;

        btn.addEventListener('click', () => {
            // Toggle active state
            document.querySelectorAll('.history-date-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            viewHistoryDetail(log.date);
        });

        container.appendChild(btn);
    });
}

window.viewHistoryDetail = function(dateStr) {
    try {
        const log = attendanceLogs.find(l => l.date === dateStr);
        if (!log) return;

        // Update selected date text
        const logDate = new Date(log.date);
        const formattedDate = logDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
        document.getElementById('detail-selected-date').textContent = formattedDate;

        // Render badges
        const badgesContainer = document.getElementById('detail-stats-badges');
        badgesContainer.innerHTML = `
            <span class="badge badge-present">معدل الحضور: ${log.stats.rate}%</span>
            <span class="badge badge-present" style="background-color:rgba(6, 214, 160, 0.1)">حضور: ${log.stats.present}</span>
            <span class="badge badge-late" style="background-color:rgba(255, 209, 102, 0.1)">متأخر: ${log.stats.late}</span>
            <span class="badge badge-absent" style="background-color:rgba(230, 57, 70, 0.1)">غياب: ${log.stats.absent}</span>
        `;

        // Render detailed student attendance status rows
        const tbody = document.getElementById('history-detail-tbody');
        tbody.innerHTML = '';

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">لا يوجد طلاب في كشف هذا اليوم.</td></tr>';
        } else {
            students.forEach(student => {
                const status = log.records[student.roll] || 'absent'; // Fallback if record was missing for new student
                
                let statusLabel = 'غائب';
                let badgeClass = 'badge-absent';
                
                if (status === 'present') {
                    statusLabel = 'حاضر';
                    badgeClass = 'badge-present';
                } else if (status === 'late') {
                    statusLabel = 'متأخر';
                    badgeClass = 'badge-late';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-outfit" style="font-weight:600; color:var(--color-gold);">${student.roll}</td>
                    <td style="font-weight:600;">${student.name}</td>
                    <td>${student.class}</td>
                    <td class="text-center">
                        <span class="badge ${badgeClass}">${statusLabel}</span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Show table wrapper, hide placeholder
        document.getElementById('detail-placeholder-msg').classList.add('hidden');
        document.getElementById('detail-table-wrapper').classList.remove('hidden');

        // Make sure the active button in the list is visually selected
        const buttons = document.querySelectorAll('.history-date-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-date') === dateStr) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

    } catch (e) {
        console.error('Error rendering history details:', e);
    }
}
