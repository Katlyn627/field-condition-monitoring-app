const STORAGE_KEY = 'east-bay-condition-tracker';

const sampleLogs = [
  {
    id: 'sample-1',
    type: 'Trail Hazard',
    location: 'Sunset Trailhead, Tilden Regional Park',
    priority: 'High',
    status: 'Reported to District',
    gps: '37.8966, -122.2484',
    date: '2026-05-19',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sample-2',
    type: 'Invasive Species',
    location: 'North Ridge Trail, Redwood Regional Park',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.8222, -122.1887',
    date: '2026-05-17',
    photo: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sample-3',
    type: 'Infrastructure/Trash',
    location: 'Morrison Canyon, Mt. Diablo State Park',
    priority: 'Immediate Safety Hazard',
    status: 'Resolved',
    gps: '37.8819, -121.9188',
    date: '2026-05-12',
    photo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sample-4',
    type: 'Wildlife Impact',
    location: 'Lake Anza Loop, Tilden Regional Park',
    priority: 'Low',
    status: 'Resolved',
    gps: '37.8998, -122.2491',
    date: '2026-05-09',
    photo: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80'
  }
];

const form = document.getElementById('incidentForm');
const tableBody = document.getElementById('incidentTableBody');
const statusFilter = document.getElementById('statusFilter');
const typeFilter = document.getElementById('typeFilter');
const photoUrlInput = document.getElementById('photoUrl');
const photoPreviewWrap = document.getElementById('photoPreviewWrap');
const photoPreview = document.getElementById('photoPreview');
const resumeOutput = document.getElementById('resumeOutput');
const copyResumeButton = document.getElementById('copyResumeButton');
const gpsInput = document.getElementById('gps');
const gpsLocationButton = document.getElementById('gpsLocationButton');

const state = {
  incidents: loadIncidents()
};

initialize();

function initialize() {
  setDefaultDate();
  attachEventListeners();
  renderDashboard();
  renderTable();
  renderResumeOutput();
}

function attachEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  statusFilter.addEventListener('change', renderTable);
  typeFilter.addEventListener('change', renderTable);
  photoUrlInput.addEventListener('input', handlePhotoPreview);
  copyResumeButton.addEventListener('click', copyResumeBullets);
  tableBody.addEventListener('click', handleTableAction);
  gpsLocationButton.addEventListener('click', handleGeolocationCapture);
}

function setDefaultDate() {
  const dateInput = document.getElementById('incidentDate');
  dateInput.value = new Date().toISOString().slice(0, 10);
}

function handleGeolocationCapture() {
  if (!('geolocation' in navigator)) {
    gpsInput.value = 'Geolocation unavailable';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude.toFixed(5);
      const longitude = position.coords.longitude.toFixed(5);
      gpsInput.value = `${latitude}, ${longitude}`;
    },
    (error) => {
      gpsInput.value = 'Location unavailable';
      console.error('Geolocation error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    }
  );
}

function loadIncidents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [...sampleLogs];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleLogs];
  } catch (error) {
    return [...sampleLogs];
  }
}

function persistIncidents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.incidents));
}

function renderDashboard() {
  const total = state.incidents.length;
  const pending = state.incidents.filter((item) => item.status !== 'Resolved').length;
  const resolved = state.incidents.filter((item) => item.status === 'Resolved').length;
  const volunteerHours = state.incidents.reduce((sum, item) => {
    if (item.status !== 'Resolved') return sum;
    return sum + estimateHours(item);
  }, 0);

  document.getElementById('totalIncidents').textContent = total;
  document.getElementById('pendingWork').textContent = pending;
  document.getElementById('resolvedItems').textContent = resolved;
  document.getElementById('volunteerHours').textContent = volunteerHours.toFixed(1);
}

function estimateHours(item) {
  const baseMap = {
    Low: 1,
    Medium: 2,
    High: 3,
    'Immediate Safety Hazard': 5
  };

  const typeMap = {
    'Trail Hazard': 1.3,
    'Invasive Species': 1.6,
    'Infrastructure/Trash': 1.9,
    'Wildlife Impact': 1.2
  };

  return Number((baseMap[item.priority] * typeMap[item.type]).toFixed(1));
}

function renderTable() {
  const statusValue = statusFilter.value;
  const typeValue = typeFilter.value;

  const filtered = state.incidents.filter((incident) => {
    const statusMatch = statusValue === 'all' || incident.status === statusValue;
    const typeMatch = typeValue === 'all' || incident.type === typeValue;
    return statusMatch && typeMatch;
  });

  if (!filtered.length) {
    tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No incidents match the current filters.</td></tr>';
    return;
  }

  tableBody.innerHTML = filtered
    .map((incident) => {
      const safeLocation = escapeHtml(incident.location);
      const safeType = escapeHtml(incident.type);
      const safePriority = escapeHtml(incident.priority);
      const safeStatus = escapeHtml(incident.status);
      const safeGps = escapeHtml(incident.gps || '—');
      const safeDate = escapeHtml(formatDate(incident.date));
      const safePhotoAlt = escapeHtml(`${incident.location} photo`);
      const photoCell = incident.photo
        ? `<img class="photo-thumb" src="${escapeAttribute(incident.photo)}" alt="${safePhotoAlt}" />`
        : '<span class="empty-state">None</span>';

      const priorityClass = toPriorityClass(incident.priority);
      const statusClass = toStatusClass(incident.status);
      const actionLabel = incident.status === 'Resolved' ? 'Reopen' : 'Resolve';

      return `
        <tr>
          <td><span class="badge ${toTypeClass(incident.type)}">${safeType}</span></td>
          <td>${safeLocation}</td>
          <td><span class="badge ${priorityClass}">${safePriority}</span></td>
          <td><span class="badge ${statusClass}">${safeStatus}</span></td>
          <td>${safeGps}</td>
          <td>${safeDate}</td>
          <td>${photoCell}</td>
          <td>
            <div class="actions">
              <button class="table-button toggle-btn" data-action="toggle" data-id="${escapeAttribute(incident.id)}">${actionLabel}</button>
              <button class="table-button remove-btn" data-action="remove" data-id="${escapeAttribute(incident.id)}">Remove</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function handleTableAction(event) {
  const target = event.target.closest('button');
  if (!target) return;

  const { action, id } = target.dataset;
  const incidentIndex = state.incidents.findIndex((entry) => entry.id === id);

  if (incidentIndex === -1) return;

  const incident = state.incidents[incidentIndex];

  if (action === 'toggle') {
    incident.status = incident.status === 'Resolved' ? 'Flagged' : 'Resolved';
  }

  if (action === 'remove') {
    state.incidents.splice(incidentIndex, 1);
  }

  persistIncidents();
  renderDashboard();
  renderTable();
  renderResumeOutput();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const incident = {
    id: `incident-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type: String(formData.get('type') || 'Trail Hazard'),
    location: String(formData.get('location') || '').trim(),
    priority: String(formData.get('priority') || 'Medium'),
    status: String(formData.get('status') || 'Flagged'),
    gps: String(formData.get('gps') || '').trim(),
    date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
    photo: sanitizeImageUrl(String(formData.get('photo') || ''))
  };

  if (!incident.location) {
    return;
  }

  state.incidents.unshift(incident);
  persistIncidents();
  renderDashboard();
  renderTable();
  renderResumeOutput();
  form.reset();
  setDefaultDate();
  handlePhotoPreview();
}

function sanitizeImageUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return parsed.toString();
    }
  } catch (error) {
    return '';
  }

  return '';
}

function handlePhotoPreview() {
  const url = sanitizeImageUrl(photoUrlInput.value);
  if (!url) {
    photoPreviewWrap.hidden = true;
    photoPreview.src = '';
    return;
  }

  photoPreview.src = url;
  photoPreviewWrap.hidden = false;
}

function renderResumeOutput() {
  const totalIncidents = state.incidents.length;
  const pending = state.incidents.filter((item) => item.status !== 'Resolved').length;
  const resolved = state.incidents.filter((item) => item.status === 'Resolved').length;
  const volunteerHours = state.incidents.reduce((sum, item) => {
    if (item.status !== 'Resolved') return sum;
    return sum + estimateHours(item);
  }, 0);
  const uniqueCount = new Set(state.incidents.map((item) => item.location)).size;
  const focusAreas = state.incidents.slice(0, 3).map((item) => item.location).join(', ');

  const bullets = [
    `• Documented and monitored ${totalIncidents} trail, habitat, and park infrastructure conditions across ${uniqueCount} locations including ${focusAreas}.`,
    `• Assessed safety hazards, invasive species pressures, and resource-impact issues using GPS points, incident logs, and field photography for stewardship decision-making.`,
    `• Prioritized corrective actions for ${pending} active incidents and tracked ${resolved} resolved work orders to ensure timely follow-up with park staff and volunteers.`,
    `• Recorded volunteer labor and field service contributions totaling ${volunteerHours.toFixed(1)} hours in support of public land protection, trail maintenance, and habitat restoration efforts.`,
    `• Collaborated with local park stakeholders, volunteers, and land management contacts to support sustainable recreation access, habitat conservation, and infrastructure upkeep.`,
    `• Maintained organized field records, GIS-style coordinates, date stamps, and photo documentation to support incident reporting, compliance review, and public service documentation.`
  ];

  const content = [
    'USAJOBS / Federal Resume (GS-0025 / GS-0404):',
    ...bullets,
    '',
    'State Park Civil Service Resume:',
    `• Supported land stewardship and park operations by logging and prioritizing ${totalIncidents} field conditions, including safety hazards, invasive species observations, and infrastructure concerns.`,
    `• Investigated environmental and maintenance issues at parks such as Tilden Regional Park, Redwood Regional Park, and Mt. Diablo State Park, preparing actionable reports for appropriate agency follow-up.`,
    `• Contributed ${volunteerHours.toFixed(1)} hours of field service and documentation work to improve trail conditions, preserve habitats, and reduce public safety risks.`,
    `• Maintained detailed records, incident summaries, GPS coordinates, and photographic evidence to support park operations, resource protection, and interagency communication.`
  ].join('\n');

  resumeOutput.value = content;
}

async function copyResumeBullets() {
  try {
    await navigator.clipboard.writeText(resumeOutput.value);
    copyResumeButton.textContent = 'Copied!';
    setTimeout(() => {
      copyResumeButton.textContent = 'Copy Resume Bullets';
    }, 1400);
  } catch (error) {
    copyResumeButton.textContent = 'Copy failed';
    setTimeout(() => {
      copyResumeButton.textContent = 'Copy Resume Bullets';
    }, 1400);
  }
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function toPriorityClass(priority) {
  if (priority === 'Immediate Safety Hazard') return 'immediate';
  if (priority === 'High') return 'high';
  if (priority === 'Medium') return 'medium';
  return 'low';
}

function toStatusClass(status) {
  if (status === 'Resolved') return 'resolved';
  if (status === 'Reported to District') return 'reported';
  return 'flagged';
}

function toTypeClass(type) {
  if (type === 'Trail Hazard') return 'flagged';
  if (type === 'Invasive Species') return 'reported';
  if (type === 'Infrastructure/Trash') return 'resolved';
  return 'low';
}
