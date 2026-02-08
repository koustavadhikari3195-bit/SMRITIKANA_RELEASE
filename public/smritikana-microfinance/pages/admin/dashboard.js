/**
 * SMRITIKANA SETU - DASHBOARD LOGIC
 * Full Stack Implementation (Supabase Ready)
 */

// --- CONFIGURATION ---
const SB_URL = ''; // Add Supabase URL
const SB_KEY = ''; // Add Supabase Anon Key

let supabase = null;
if (SB_URL && SB_KEY) {
    supabase = window.supabase.createClient(SB_URL, SB_KEY);
}

// --- MOCK DATA ---
const MOCK_ASSESSMENTS = [
    { id: 101, created_at: '2026-02-08T10:30:00', location: 'Rural - Howrah', income: 240000, debt: 5000, foir: 25.0, status: 'pass' },
    { id: 102, created_at: '2026-02-08T11:15:00', location: 'Urban - Kolkata', income: 320000, debt: 12000, foir: 45.0, status: 'fail' },
    { id: 103, created_at: '2026-02-07T09:45:00', location: 'Rural - Hooghly', income: 180000, debt: 2000, foir: 13.3, status: 'pass' },
    { id: 104, created_at: '2026-02-07T14:20:00', location: 'Urban - Pune', income: 290000, debt: 15000, foir: 62.1, status: 'fail' },
    { id: 105, created_at: '2026-02-06T16:50:00', location: 'Rural - Nadia', income: 210000, debt: 4500, foir: 25.7, status: 'pass' }
];

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    loadDashboardData();
    setupEventListeners();
});

/**
 * Handle Sidebar Navigation
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const viewPanels = document.querySelectorAll('.view-panel');
    const viewTitle = document.getElementById('viewTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');

            // Toggle active classes
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            viewPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`${targetView}View`).classList.add('active');

            // Update Title
            viewTitle.textContent = item.querySelector('span').textContent + " Overview";
        });
    });
}

/**
 * Load and Render Data
 */
async function loadDashboardData() {
    let assessments = [...MOCK_ASSESSMENTS];

    // Load from LocalStorage (Demo Full Stack)
    const localData = JSON.parse(localStorage.getItem('setu_assessments') || '[]');
    if (localData.length > 0) {
        // Merge and sort by ID/time
        assessments = [...localData, ...MOCK_ASSESSMENTS].sort((a, b) => b.id - a.id);
    }

    // Fetch from Supabase if available
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) assessments = data;
        } catch (err) {
            console.warn("Supabase fetch failed, using local/mock data.", err);
        }
    }

    renderAssessmentTable(assessments);
    updateStats(assessments);
}

/**
 * Update Stats based on loaded data
 */
function updateStats(data) {
    const total = data.length;
    const passes = data.filter(a => a.status === 'pass').length;
    const passRate = total > 0 ? Math.round((passes / total) * 100) : 0;
    const risk = data.filter(a => a.foir > 40).length;

    // Direct UI update
    animateNumber('statAssessments', total);
    document.getElementById('statPassRate').textContent = `${passRate}%`;
    animateNumber('statRisk', risk);
}

/**
 * Render Data to Table
 */
function renderAssessmentTable(data) {
    const tableBody = document.getElementById('assessmentTableBody');
    const fullAuditBody = document.getElementById('fullAuditBody');

    if (!tableBody) return;

    const rows = data.slice(0, 5).map(item => `
        <tr>
            <td>${new Date(item.created_at).toLocaleDateString()}</td>
            <td>${item.location}</td>
            <td>₹${item.income.toLocaleString()}</td>
            <td>${item.foir.toFixed(1)}%</td>
            <td><span class="status-badge ${item.status}">${item.status.toUpperCase()}</span></td>
        </tr>
    `).join('');

    tableBody.innerHTML = rows;

    // Also populate full audit if visible
    if (fullAuditBody) {
        fullAuditBody.innerHTML = data.map(item => `
            <tr>
                <td>#${item.id}</td>
                <td>${new Date(item.created_at).toLocaleString()}</td>
                <td>₹${item.income.toLocaleString()}</td>
                <td>₹${item.debt.toLocaleString()}</td>
                <td>${item.foir.toFixed(1)}%</td>
                <td><span class="status-badge ${item.status}">${item.status === 'pass' ? 'Compliant' : 'Breach'}</span></td>
                <td><button class="btn btn-sm outline" onclick="viewAudit(${item.id})">View</button></td>
            </tr>
        `).join('');
    }
}

/**
 * Utility: Animate numbers for extra WOW
 */
function animateNumber(id, end) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const duration = 1000;
    const stepTime = 50;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
            el.textContent = Math.floor(end);
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start);
        }
    }, stepTime);
}

function setupEventListeners() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm("Logout from SETU Admin?")) {
            window.location.href = "../../index.html";
        }
    });

    // Mock search filter
    document.querySelector('.search-box input')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = MOCK_ASSESSMENTS.filter(a => a.location.toLowerCase().includes(query));
        renderAssessmentTable(filtered);
    });
}

// Export for external use
window.viewAudit = (id) => {
    alert("Audit Details for ID: " + id + "\nThis feature requires Full Supabase Integration.");
};
