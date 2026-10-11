/**
 * University Research Opportunity Portal - Frontend Application
 * Communicates with backend REST API at /api/opportunities
 * No hard-coded opportunity data.
 */

// API Base Endpoint
const API_BASE = '/api/opportunities';

// Application State
let opportunities = [];
let pendingDeleteId = null;

// DOM Elements
const opportunitiesContainer = document.getElementById('opportunitiesContainer');
const totalCountEl = document.getElementById('totalCount');
const openCountEl = document.getElementById('openCount');
const closedCountEl = document.getElementById('closedCount');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const btnRefresh = document.getElementById('btnRefresh');
const btnCreateNew = document.getElementById('btnCreateNew');

// Alert Elements
const alertBox = document.getElementById('alertBox');
const alertMessage = document.getElementById('alertMessage');
const alertCloseBtn = document.getElementById('alertCloseBtn');

// Details Modal Elements
const detailsModal = document.getElementById('detailsModal');
const detailsModalBody = document.getElementById('detailsModalBody');

// Form Modal Elements
const formModal = document.getElementById('formModal');
const formModalTitle = document.getElementById('formModalTitle');
const opportunityForm = document.getElementById('opportunityForm');
const formErrorBox = document.getElementById('formErrorBox');
const formErrorMessage = document.getElementById('formErrorMessage');
const btnSubmitForm = document.getElementById('btnSubmitForm');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteOpportunityTitle = document.getElementById('deleteOpportunityTitle');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadOpportunities();
});

// Event Listeners Setup
function initEventListeners() {
    btnCreateNew.addEventListener('click', openCreateModal);
    btnRefresh.addEventListener('click', loadOpportunities);
    searchInput.addEventListener('input', renderFilteredOpportunities);
    statusFilter.addEventListener('change', renderFilteredOpportunities);
    alertCloseBtn.addEventListener('click', hideAlert);

    opportunityForm.addEventListener('submit', handleFormSubmit);
    btnConfirmDelete.addEventListener('click', handleConfirmDelete);

    // Close modals when clicking close button or background overlay
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// =====================================================================
// 1. Fetch & Display All Research Opportunities (GET /api/opportunities)
// =====================================================================
async function loadOpportunities() {
    showLoading();
    try {
        const response = await fetch(API_BASE);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch opportunities.');
        }

        opportunities = Array.isArray(result.data) ? result.data : [];
        updateStats();
        renderFilteredOpportunities();
    } catch (error) {
        console.error('Error loading opportunities:', error);
        showAlert(error.message || 'Error connecting to the server. Please verify MySQL and backend server are running.', 'error');
        opportunitiesContainer.innerHTML = `
            <div class="empty-state">
                <p class="text-danger">Failed to load opportunities from server.</p>
                <p class="small text-muted" style="margin-top: 0.5rem;">${escapeHtml(error.message)}</p>
                <button class="btn btn-secondary btn-sm" onclick="loadOpportunities()" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

// Update summary stats
function updateStats() {
    const total = opportunities.length;
    const open = opportunities.filter(o => o.status === 'Open').length;
    const closed = opportunities.filter(o => o.status === 'Closed').length;

    totalCountEl.textContent = total;
    openCountEl.textContent = open;
    closedCountEl.textContent = closed;
}

// Filter and render cards
function renderFilteredOpportunities() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filterStatus = statusFilter.value;

    const filtered = opportunities.filter(item => {
        const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
        const matchesSearch = !searchTerm || (
            (item.title && item.title.toLowerCase().includes(searchTerm)) ||
            (item.faculty_name && item.faculty_name.toLowerCase().includes(searchTerm)) ||
            (item.research_area && item.research_area.toLowerCase().includes(searchTerm)) ||
            (item.department && item.department.toLowerCase().includes(searchTerm)) ||
            (item.required_skills && item.required_skills.toLowerCase().includes(searchTerm))
        );
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        opportunitiesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Research Opportunities Found</h3>
                <p class="text-muted small">
                    ${opportunities.length === 0 ? 'No opportunities exist in the database yet. Click "+ Post New Opportunity" to create one.' : 'No opportunities match your search or filter criteria.'}
                </p>
            </div>
        `;
        return;
    }

    opportunitiesContainer.innerHTML = filtered.map(item => `
        <article class="opportunity-card" id="card-${item.id}">
            <div class="card-header">
                <div class="card-status-row">
                    <span class="badge ${item.status === 'Open' ? 'badge-open' : 'badge-closed'}">
                        ● ${escapeHtml(item.status)}
                    </span>
                    <span class="area-badge">${escapeHtml(item.research_area)}</span>
                </div>
                <h3 class="card-title">${escapeHtml(item.title)}</h3>
                <p class="card-faculty"><strong>Supervisor:</strong> ${escapeHtml(item.faculty_name)}</p>
                <p class="card-department">${escapeHtml(item.department)}</p>
            </div>

            <p class="card-description">${escapeHtml(item.description)}</p>

            <div class="card-meta">
                <div class="meta-item">
                    <span>Positions:</span> <strong>${item.available_positions}</strong>
                </div>
                <div class="meta-item">
                    <span>Deadline:</span> <strong>${formatDate(item.application_deadline)}</strong>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn btn-secondary btn-sm" onclick="viewOpportunityDetails(${item.id})">
                    View Details
                </button>
                <button class="btn btn-secondary btn-sm" onclick="openEditModal(${item.id})">
                    Edit
                </button>
                <button class="btn btn-secondary btn-sm" onclick="toggleOpportunityStatus(${item.id}, '${item.status}')">
                    ${item.status === 'Open' ? 'Close Opening' : 'Reopen'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${item.id})">
                    Delete
                </button>
            </div>
        </article>
    `).join('');
}

// =====================================================================
// 2. View Complete Details (GET /api/opportunities/:id)
// =====================================================================
async function viewOpportunityDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch opportunity details.');
        }

        const opp = result.data;
        detailsModalBody.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Research Title</div>
                <h3 class="detail-value" style="font-size: 1.25rem; font-weight: 600;">${escapeHtml(opp.title)}</h3>
            </div>

            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div>
                        <span class="badge ${opp.status === 'Open' ? 'badge-open' : 'badge-closed'}">
                            ● ${escapeHtml(opp.status)}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Research Area</div>
                    <div class="detail-value"><strong>${escapeHtml(opp.research_area)}</strong></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Faculty Supervisor</div>
                    <div class="detail-value">${escapeHtml(opp.faculty_name)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Department</div>
                    <div class="detail-value">${escapeHtml(opp.department)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Available Positions</div>
                    <div class="detail-value"><strong>${opp.available_positions}</strong></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Application Deadline</div>
                    <div class="detail-value"><strong>${formatDate(opp.application_deadline)}</strong></div>
                </div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Description & Scope</div>
                <div class="detail-box">${escapeHtml(opp.description)}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Required Skills & Prerequisites</div>
                <div class="detail-box">${escapeHtml(opp.required_skills)}</div>
            </div>

            <div class="detail-item">
                <span class="text-muted small">Record ID: <strong>#${opp.id}</strong> | Posted: ${formatDate(opp.created_at)}</span>
            </div>
        `;

        openModal(detailsModal);
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        showAlert(error.message, 'error');
    }
}

// =====================================================================
// 3 & 4. Create and Update Opportunities (POST & PUT)
// =====================================================================
function openCreateModal() {
    opportunityForm.reset();
    document.getElementById('opportunityId').value = '';
    formModalTitle.textContent = 'Post New Research Opportunity';
    btnSubmitForm.textContent = 'Save Opportunity';
    document.getElementById('status').value = 'Open';
    hideFormError();
    openModal(formModal);
}

async function openEditModal(id) {
    hideFormError();
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Could not load opportunity for editing.');
        }

        const opp = result.data;
        document.getElementById('opportunityId').value = opp.id;
        document.getElementById('title').value = opp.title || '';
        document.getElementById('faculty_name').value = opp.faculty_name || '';
        document.getElementById('department').value = opp.department || '';
        document.getElementById('research_area').value = opp.research_area || '';
        document.getElementById('available_positions').value = opp.available_positions;
        document.getElementById('application_deadline').value = formatDate(opp.application_deadline);
        document.getElementById('status').value = opp.status || 'Open';
        document.getElementById('description').value = opp.description || '';
        document.getElementById('required_skills').value = opp.required_skills || '';

        formModalTitle.textContent = 'Edit Research Opportunity';
        btnSubmitForm.textContent = 'Update Opportunity';
        openModal(formModal);
    } catch (error) {
        console.error('Error loading opportunity for edit:', error);
        showAlert(error.message, 'error');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    hideFormError();

    const id = document.getElementById('opportunityId').value;
    const title = document.getElementById('title').value.trim();
    const faculty_name = document.getElementById('faculty_name').value.trim();
    const department = document.getElementById('department').value.trim();
    const research_area = document.getElementById('research_area').value.trim();
    const available_positions = document.getElementById('available_positions').value.trim();
    const application_deadline = document.getElementById('application_deadline').value.trim();
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value.trim();
    const required_skills = document.getElementById('required_skills').value.trim();

    // Client-side Validation (Requirement 8 & 9)
    if (!title || !faculty_name || !department || !research_area || !available_positions || !application_deadline || !description || !required_skills) {
        showFormError('Please fill in all mandatory fields.');
        return;
    }

    const positionsNum = parseInt(available_positions, 10);
    if (isNaN(positionsNum) || positionsNum < 0) {
        showFormError('Available positions must be a non-negative number (0 or greater).');
        return;
    }

    const payload = {
        title,
        faculty_name,
        department,
        research_area,
        available_positions: positionsNum,
        application_deadline,
        status,
        description,
        required_skills
    };

    const isEdit = Boolean(id);
    const url = isEdit ? `${API_BASE}/${id}` : API_BASE;
    const method = isEdit ? 'PUT' : 'POST';

    btnSubmitForm.disabled = true;
    btnSubmitForm.textContent = isEdit ? 'Updating...' : 'Saving...';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Operation failed.');
        }

        closeAllModals();
        showAlert(
            isEdit ? 'Research opportunity updated successfully!' : 'New research opportunity posted successfully!',
            'success'
        );
        loadOpportunities();
    } catch (error) {
        console.error('Form submission error:', error);
        showFormError(error.message);
    } finally {
        btnSubmitForm.disabled = false;
        btnSubmitForm.textContent = isEdit ? 'Update Opportunity' : 'Save Opportunity';
    }
}

// =====================================================================
// 5. Toggle Status Between Open and Closed (PUT /api/opportunities/:id)
// =====================================================================
async function toggleOpportunityStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update opportunity status.');
        }

        showAlert(`Opportunity status changed from ${currentStatus} to ${newStatus}.`, 'success');
        loadOpportunities();
    } catch (error) {
        console.error('Error toggling status:', error);
        showAlert(error.message, 'error');
    }
}

// =====================================================================
// 6. Delete an Opportunity (DELETE /api/opportunities/:id)
// =====================================================================
function openDeleteModal(id) {
    const opp = opportunities.find(o => o.id === id);
    pendingDeleteId = id;
    deleteOpportunityTitle.textContent = opp ? `"${opp.title}"` : `Opportunity #${id}`;
    openModal(deleteModal);
}

async function handleConfirmDelete() {
    if (!pendingDeleteId) return;

    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = 'Deleting...';

    try {
        const response = await fetch(`${API_BASE}/${pendingDeleteId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete research opportunity.');
        }

        closeAllModals();
        showAlert('Research opportunity deleted successfully.', 'success');
        loadOpportunities();
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        showAlert(error.message, 'error');
    } finally {
        btnConfirmDelete.disabled = false;
        btnConfirmDelete.textContent = 'Delete Opportunity';
        pendingDeleteId = null;
    }
}

// =====================================================================
// UI Helper Functions (Modals, Alerts, Formatting)
// =====================================================================
function openModal(modalEl) {
    modalEl.classList.remove('d-none');
}

function closeAllModals() {
    detailsModal.classList.add('d-none');
    formModal.classList.add('d-none');
    deleteModal.classList.add('d-none');
    pendingDeleteId = null;
}

let alertTimeout = null;
function showAlert(message, type = 'success') {
    if (alertTimeout) clearTimeout(alertTimeout);

    alertMessage.textContent = message;
    alertBox.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
    alertBox.classList.remove('d-none');

    // Auto-hide alert after 5 seconds
    alertTimeout = setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    alertBox.classList.add('d-none');
}

function showFormError(message) {
    formErrorMessage.textContent = message;
    formErrorBox.classList.remove('d-none');
}

function hideFormError() {
    formErrorBox.classList.add('d-none');
    formErrorMessage.textContent = '';
}

function showLoading() {
    opportunitiesContainer.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading research opportunities from database...</p>
        </div>
    `;
}

function formatDate(dateVal) {
    if (!dateVal) return 'N/A';
    if (typeof dateVal === 'string') {
        return dateVal.split('T')[0].split(' ')[0];
    }
    try {
        const d = new Date(dateVal);
        return d.toISOString().split('T')[0];
    } catch {
        return String(dateVal);
    }
}

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
