const STORAGE_KEY = 'east-bay-condition-tracker';

const sampleLogs = [
  {
    id: 'sample-1',
    type: 'Trail Hazard',
    location: 'Sunset Trailhead, Tilden Regional Park',
    trailName: 'Sunset Trail',
    mileMarker: '2.1',
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
    trailName: 'North Ridge Trail',
    mileMarker: '',
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
    trailName: 'Morrison Canyon Road',
    mileMarker: '0.8',
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
    trailName: 'Lake Anza Trail',
    mileMarker: '',
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
const locationInput = document.getElementById('location');
const pendingTrailMatchInput = document.getElementById('pendingTrailMatch');
const photoUrlInput = document.getElementById('photoUrl');
const photoInput = document.getElementById('photoInput');
const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const resumeOutput = document.getElementById('resumeOutput');
const copyResumeButton = document.getElementById('copyResumeButton');
const clearFormButton = document.getElementById('clearFormButton');
const exportGpxButton = document.getElementById('exportGpxButton');
const importGpxButton = document.getElementById('importGpxButton');
const importGpxInput = document.getElementById('importGpxInput');
const gpsInput = document.getElementById('gps');
const gpsLocationButton = document.getElementById('gpsLocationButton');
const gpsStatusBadge = document.getElementById('gpsStatusBadge');
const photoStatusBadge = document.getElementById('photoStatusBadge');
const offlineStatus = document.getElementById('offlineStatus');

const state = {
  incidents: loadIncidents(),
  selectedPhotoDataUrl: '',
  editingIncidentId: null,
  isMobileLayout: window.innerWidth < 768,
  layoutViewportWidth: window.innerWidth
};

const TRAILHEADS = [
  { name: 'Sunset Trailhead, Tilden Regional Park', latitude: 37.8965, longitude: -122.2486 },
  { name: 'Morrison Canyon, Mt. Diablo State Park', latitude: 37.8819, longitude: -121.9188 },
  { name: 'Redwood Ridge Trailhead, Redwood Regional Park', latitude: 37.8222, longitude: -122.1887 },
  { name: 'Del Valle Regional Park', latitude: 37.6036, longitude: -121.7608 },
  { name: 'Sunol Wilderness, Sunol', latitude: 37.4957, longitude: -121.8812 }
];

initialize();

function initialize() {
  setDefaultDate();
  attachEventListeners();
  updateConnectionStatus();
  updateGpsStatusBadge(false);
  updatePhotoStatusBadge(false);
  renderDashboard();
  renderTable();
  renderResumeOutput();
  syncLayoutForViewport(false);
}

function attachEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  statusFilter.addEventListener('change', renderTable);
  typeFilter.addEventListener('change', renderTable);
  pendingTrailMatchInput.addEventListener('change', handlePendingTrailMatchToggle);
  photoUrlInput.addEventListener('input', () => {
    state.selectedPhotoDataUrl = '';
    handlePhotoPreview();
  });
  photoInput.addEventListener('change', handlePhotoUpload);
  copyResumeButton.addEventListener('click', copyResumeBullets);
  clearFormButton.addEventListener('click', clearIncidentForm);
  exportGpxButton.addEventListener('click', handleGpxExport);
  importGpxButton.addEventListener('click', () => importGpxInput.click());
  importGpxInput.addEventListener('change', handleGpxImport);
  tableBody.addEventListener('click', handleTableAction);
  tableBody.addEventListener('submit', handleInlineEditSubmit);
  gpsInput.addEventListener('input', () => {
    updateGpsStatusBadge(Boolean(gpsInput.value.trim()) && gpsInput.value !== 'Location unavailable');
  });
  gpsLocationButton.addEventListener('click', handleGeolocationCapture);
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  window.addEventListener('resize', handleWindowResize);
}

function handlePendingTrailMatchToggle() {
  const statusInput = document.getElementById('status');
  if (pendingTrailMatchInput.checked) {
    statusInput.value = 'Pending Trail Match';
    return;
  }

  if (statusInput.value === 'Pending Trail Match') {
    statusInput.value = 'Flagged';
  }
}

function setDefaultDate() {
  const dateInput = document.getElementById('incidentDate');
  dateInput.value = new Date().toISOString().slice(0, 10);
}

function updateConnectionStatus() {
  if (!offlineStatus) return;

  const online = navigator.onLine;
  offlineStatus.innerHTML = `
    <span class="status-dot ${online ? 'online' : 'offline'}"></span>
    <span>${online ? 'Online' : 'Offline'}</span>
  `;
  offlineStatus.classList.toggle('offline', !online);
}

function updateGpsStatusBadge(hasCoordinates) {
  if (!gpsStatusBadge) return;
  gpsStatusBadge.hidden = !hasCoordinates;
}

function updatePhotoStatusBadge(hasPhoto) {
  if (!photoStatusBadge) return;
  photoStatusBadge.hidden = !hasPhoto;
}

let resizeAnimationFrame = null;

function handleWindowResize() {
  if (resizeAnimationFrame) {
    cancelAnimationFrame(resizeAnimationFrame);
  }

  resizeAnimationFrame = requestAnimationFrame(() => {
    syncLayoutForViewport(true);
    resizeAnimationFrame = null;
  });
}

function syncLayoutForViewport(shouldRenderTable) {
  const viewportWidth = window.innerWidth;
  const isMobileLayout = viewportWidth < 768;
  const layoutChanged = state.isMobileLayout !== isMobileLayout || state.layoutViewportWidth !== viewportWidth;

  state.isMobileLayout = isMobileLayout;
  state.layoutViewportWidth = viewportWidth;
  document.body.setAttribute('data-layout-mode', isMobileLayout ? 'mobile' : 'desktop');

  if (shouldRenderTable && layoutChanged) {
    renderTable();
  }

  renderPhotoPreview();
}

function handleGeolocationCapture() {
  if (!('geolocation' in navigator)) {
    gpsInput.value = 'Geolocation unavailable';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = Number(position.coords.latitude);
      const longitude = Number(position.coords.longitude);
      gpsInput.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      updateGpsStatusBadge(true);

      const trailheadName = findNearbyTrailhead(latitude, longitude);
      if (trailheadName && !locationInput.value.trim()) {
        locationInput.value = trailheadName;
      }
    },
    (error) => {
      gpsInput.value = 'Location unavailable';
      updateGpsStatusBadge(false);
      console.error('Geolocation error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

function findNearbyTrailhead(latitude, longitude) {
  let closestTrailhead = null;
  let shortestDistance = Infinity;

  TRAILHEADS.forEach((trailhead) => {
    const distanceKm = calculateDistanceKm(latitude, longitude, trailhead.latitude, trailhead.longitude);
    if (distanceKm < shortestDistance) {
      shortestDistance = distanceKm;
      closestTrailhead = trailhead;
    }
  });

  return shortestDistance <= 0.5 ? closestTrailhead.name : null;
}

function calculateDistanceKm(latitude1, longitude1, latitude2, longitude2) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(latitude2 - latitude1);
  const longitudeDelta = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2)) *
    Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function loadIncidents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return sampleLogs.map(normalizeIncident);
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.length) {
      return sampleLogs.map(normalizeIncident);
    }

    return parsed.map(normalizeIncident);
  } catch (error) {
    return sampleLogs.map(normalizeIncident);
  }
}

function normalizeIncident(rawIncident = {}) {
  const normalized = {
    id: String(rawIncident.id || `incident-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
    type: String(rawIncident.type || 'Trail Hazard'),
    location: String(rawIncident.location || '').trim(),
    trailName: String(rawIncident.trailName || '').trim(),
    mileMarker: String(rawIncident.mileMarker || '').trim(),
    priority: String(rawIncident.priority || 'Medium'),
    status: String(rawIncident.status || 'Flagged'),
    gps: String(rawIncident.gps || '').trim(),
    date: String(rawIncident.date || new Date().toISOString().slice(0, 10)),
    photo: sanitizeImageUrl(rawIncident.photo || ''),
    notes: String(rawIncident.notes || '').trim()
  };

  if (normalized.status !== 'Flagged' && normalized.status !== 'Pending Trail Match' && normalized.status !== 'Reported to District' && normalized.status !== 'Resolved') {
    normalized.status = 'Flagged';
  }

  if (!normalized.location && normalized.trailName) {
    normalized.location = normalized.trailName;
  }

  return normalized;
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
      const safeLocation = escapeHtml(incident.location || '—');
      const safeType = escapeHtml(incident.type);
      const safePriority = escapeHtml(incident.priority);
      const safeStatus = escapeHtml(incident.status);
      const safeGps = escapeHtml(incident.gps || '—');
      const safeDate = escapeHtml(formatDate(incident.date));
      const safePhotoAlt = escapeHtml(`${incident.location || incident.type} photo`);
      const coordinates = parseGpsCoordinates(incident.gps);
      const photoCell = incident.photo
        ? `<img class="photo-thumb" src="${escapeAttribute(incident.photo)}" alt="${safePhotoAlt}" />`
        : '<span class="empty-state">None</span>';

      const trailMeta = renderTrailMeta(incident);
      const externalMapActions = renderExternalMapActions(incident, coordinates);
      const isEditing = state.editingIncidentId === incident.id;
      const editPanel = isEditing ? renderInlineEditForm(incident) : '';

      const priorityClass = toPriorityClass(incident.priority);
      const statusClass = toStatusClass(incident.status);
      const actionLabel = incident.status === 'Resolved' ? 'Reopen' : 'Resolve';

      return `
        <tr>
          <td data-label="Type"><span class="badge ${toTypeClass(incident.type)}">${safeType}</span></td>
          <td data-label="Location">${safeLocation}${trailMeta}</td>
          <td data-label="Priority"><span class="badge ${priorityClass}">${safePriority}</span></td>
          <td data-label="Status"><span class="badge ${statusClass}">${safeStatus}</span></td>
          <td data-label="GPS">${safeGps}</td>
          <td data-label="Date">${safeDate}</td>
          <td data-label="Photo">${photoCell}</td>
          <td data-label="Actions">
            <div class="actions">
              ${externalMapActions}
              <button class="table-button" data-action="edit-match" data-id="${escapeAttribute(incident.id)}">Update Location / Match Trail</button>
              <button class="table-button toggle-btn" data-action="toggle" data-id="${escapeAttribute(incident.id)}">${actionLabel}</button>
              <button class="table-button remove-btn" data-action="remove" data-id="${escapeAttribute(incident.id)}">Remove</button>
              ${editPanel}
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderTrailMeta(incident) {
  const trailName = escapeHtml(incident.trailName || '');
  const mileMarker = escapeHtml(incident.mileMarker || '');
  const chips = [];

  if (trailName) {
    chips.push(`<span class="trail-chip">Trail: ${trailName}</span>`);
  }

  if (mileMarker) {
    chips.push(`<span class="trail-chip">Mile: ${mileMarker}</span>`);
  }

  if (!chips.length) {
    return '';
  }

  return `<div class="trail-meta">${chips.join('')}</div>`;
}

function renderExternalMapActions(incident, coordinates) {
  const hasCoordinates = Boolean(coordinates);
  const safeId = escapeAttribute(incident.id);
  const disabledAttr = hasCoordinates ? '' : ' disabled';
  const unavailableTitle = hasCoordinates ? '' : ' title="GPS coordinates required"';

  return `
    <div class="external-map-group">
      <span class="external-map-label">Open in External Maps</span>
      <div class="external-map-actions">
        <button class="table-button" data-action="open-alltrails" data-id="${safeId}">AllTrails Search</button>
        <button class="table-button" data-action="open-google" data-id="${safeId}"${disabledAttr}${unavailableTitle}>Google Maps</button>
        <button class="table-button" data-action="open-apple" data-id="${safeId}"${disabledAttr}${unavailableTitle}>Apple / Geo</button>
        <button class="table-button" data-action="open-gaia" data-id="${safeId}"${disabledAttr}${unavailableTitle}>Gaia GPS</button>
      </div>
    </div>
  `;
}

function renderInlineEditForm(incident) {
  const safeId = escapeAttribute(incident.id);
  const status = incident.status || 'Flagged';
  const pendingChecked = status === 'Pending Trail Match' ? ' checked' : '';

  return `
    <form class="inline-edit-form" data-edit-form="true" data-id="${safeId}">
      <label>
        <span>Location / Trailhead</span>
        <input type="text" name="editLocation" value="${escapeAttribute(incident.location || '')}" placeholder="Update location">
      </label>
      <label>
        <span>AllTrails Trail Name</span>
        <input type="text" name="editTrailName" value="${escapeAttribute(incident.trailName || '')}" placeholder="e.g., Seaview Trail">
      </label>
      <label>
        <span>Mile Marker</span>
        <input type="text" name="editMileMarker" value="${escapeAttribute(incident.mileMarker || '')}" placeholder="e.g., 3.2">
      </label>
      <label>
        <span>GPS Coordinates</span>
        <input type="text" name="editGps" value="${escapeAttribute(incident.gps || '')}" placeholder="37.8741,-122.2861">
      </label>
      <label>
        <span>Status</span>
        <select name="editStatus">
          ${renderStatusOptions(status)}
        </select>
      </label>
      <label class="check-row">
        <input type="checkbox" name="editPendingTrailMatch"${pendingChecked}>
        <span>Mark as Pending Trail Match</span>
      </label>
      <label>
        <span>Photo URL (optional)</span>
        <input type="url" name="editPhotoUrl" placeholder="https://example.com/trail-photo.jpg">
      </label>
      <label>
        <span>Upload Photo (optional)</span>
        <input type="file" name="editPhotoFile" accept="image/*">
      </label>
      <div class="inline-edit-actions">
        <button class="table-button toggle-btn" type="submit">Save Trail Match</button>
        <button class="table-button remove-btn" type="button" data-action="cancel-edit" data-id="${safeId}">Cancel</button>
      </div>
    </form>
  `;
}

function renderStatusOptions(currentStatus) {
  const statuses = ['Flagged', 'Pending Trail Match', 'Reported to District', 'Resolved'];
  return statuses
    .map((status) => `<option value="${escapeAttribute(status)}"${currentStatus === status ? ' selected' : ''}>${escapeHtml(status)}</option>`)
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
  if (!action || !id) return;

  const incidentIndex = state.incidents.findIndex((entry) => entry.id === id);
  if (incidentIndex === -1) return;

  const incident = state.incidents[incidentIndex];

  if (action === 'open-alltrails' || action === 'open-google' || action === 'open-apple' || action === 'open-gaia') {
    openExternalMapForIncident(action, incident);
    return;
  }

  if (action === 'edit-match') {
    state.editingIncidentId = incident.id;
    renderTable();
    return;
  }

  if (action === 'cancel-edit') {
    state.editingIncidentId = null;
    renderTable();
    return;
  }

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

function openExternalMapForIncident(action, incident) {
  const coordinates = parseGpsCoordinates(incident.gps);
  const urlByAction = {
    'open-alltrails': getAllTrailsDeepLink(incident, coordinates),
    'open-google': coordinates ? getGoogleMapsDeepLink(coordinates.latitude, coordinates.longitude) : '',
    'open-apple': coordinates ? getGeoDeepLink(coordinates.latitude, coordinates.longitude) : '',
    'open-gaia': coordinates ? getGaiaGpsDeepLink(coordinates.latitude, coordinates.longitude) : ''
  };

  const targetUrl = urlByAction[action];
  if (!targetUrl) {
    return;
  }

  if (targetUrl.startsWith('geo:')) {
    window.location.href = targetUrl;
    return;
  }

  window.open(targetUrl, '_blank', 'noopener');
}

function getAllTrailsDeepLink(incident, coordinates) {
  if (coordinates) {
    return `https://www.alltrails.com/explore?b_tl_lat=${coordinates.latitude}&b_tl_lng=${coordinates.longitude}`;
  }

  const query = incident.trailName || incident.location || 'east bay trail';
  return `https://www.alltrails.com/search?q=${encodeURIComponent(query)}`;
}

function getGoogleMapsDeepLink(latitude, longitude) {
  return `https://www.google.com/maps?q=${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;
}

function getGeoDeepLink(latitude, longitude) {
  return `geo:${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;
}

function getGaiaGpsDeepLink(latitude, longitude) {
  return `https://www.gaiagps.com/map/?loc=14/${Number(longitude).toFixed(6)}/${Number(latitude).toFixed(6)}`;
}

async function handleInlineEditSubmit(event) {
  const editForm = event.target.closest('form[data-edit-form="true"]');
  if (!editForm) return;

  event.preventDefault();

  const incidentId = editForm.dataset.id;
  const incident = state.incidents.find((entry) => entry.id === incidentId);
  if (!incident) return;

  const formData = new FormData(editForm);
  const pendingTrailMatch = Boolean(formData.get('editPendingTrailMatch'));
  const location = String(formData.get('editLocation') || '').trim();
  const trailName = String(formData.get('editTrailName') || '').trim();
  const mileMarker = String(formData.get('editMileMarker') || '').trim();
  const gps = String(formData.get('editGps') || '').trim();
  const selectedStatus = String(formData.get('editStatus') || 'Flagged');
  const status = pendingTrailMatch ? 'Pending Trail Match' : selectedStatus;
  const photoUrlInputValue = String(formData.get('editPhotoUrl') || '').trim();
  const editPhotoFile = formData.get('editPhotoFile');

  const updatedPhoto = await resolveInlineEditPhoto(editPhotoFile, photoUrlInputValue, incident.photo);

  incident.location = location || incident.location;
  incident.trailName = trailName;
  incident.mileMarker = mileMarker;
  incident.gps = gps;
  incident.status = status;
  incident.photo = updatedPhoto;

  if (!incident.location && incident.trailName) {
    incident.location = incident.trailName;
  }

  state.editingIncidentId = null;
  persistIncidents();
  renderDashboard();
  renderTable();
  renderResumeOutput();
}

async function resolveInlineEditPhoto(fileFieldValue, photoUrl, fallbackPhoto) {
  if (fileFieldValue instanceof File && fileFieldValue.size > 0) {
    const dataUrl = await readFileAsDataUrl(fileFieldValue);
    return dataUrl.startsWith('data:image/') ? dataUrl : fallbackPhoto;
  }

  const sanitizedUrl = sanitizeImageUrl(photoUrl);
  if (sanitizedUrl) {
    return sanitizedUrl;
  }

  return fallbackPhoto;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const pendingTrailMatch = Boolean(formData.get('pendingTrailMatch'));
  const location = String(formData.get('location') || '').trim();
  const gps = String(formData.get('gps') || '').trim();

  const incident = normalizeIncident({
    id: `incident-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type: String(formData.get('type') || 'Trail Hazard'),
    location,
    priority: String(formData.get('priority') || 'Medium'),
    status: pendingTrailMatch ? 'Pending Trail Match' : String(formData.get('status') || 'Flagged'),
    gps,
    date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
    photo: getSelectedPhotoValue()
  });

  if (!incident.location && !incident.gps) {
    window.alert('Add either a location/trail name or GPS coordinates before logging this incident.');
    return;
  }

  if (!incident.location && incident.gps) {
    incident.location = 'Pending trail match';
  }

  state.incidents.unshift(incident);
  state.editingIncidentId = null;
  persistIncidents();
  renderDashboard();
  renderTable();
  renderResumeOutput();
  clearIncidentForm();
}

function getSelectedPhotoValue() {
  if (state.selectedPhotoDataUrl) {
    return state.selectedPhotoDataUrl;
  }

  return sanitizeImageUrl(photoUrlInput.value);
}

function sanitizeImageUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

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

function handlePhotoUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    resetPhotoSelection();
    return;
  }

  if (!file.type.startsWith('image/')) {
    resetPhotoSelection();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = typeof reader.result === 'string' ? reader.result : '';
    state.selectedPhotoDataUrl = dataUrl.startsWith('data:image/') ? dataUrl : '';
    photoUrlInput.value = '';
    updatePhotoStatusBadge(Boolean(state.selectedPhotoDataUrl));
    renderPhotoPreview();
  };
  reader.onerror = () => {
    resetPhotoSelection();
  };

  reader.readAsDataURL(file);
}

function resetPhotoSelection() {
  state.selectedPhotoDataUrl = '';
  photoInput.value = '';
  photoUrlInput.value = '';
  updatePhotoStatusBadge(false);
  renderPhotoPreview();
}

function clearIncidentForm() {
  form.reset();
  gpsInput.value = '';
  pendingTrailMatchInput.checked = false;
  updateGpsStatusBadge(false);
  resetPhotoSelection();
  setDefaultDate();
  handlePhotoPreview();
}

function handlePhotoPreview() {
  if (state.selectedPhotoDataUrl) {
    renderPhotoPreview();
    return;
  }

  const url = sanitizeImageUrl(photoUrlInput.value);
  if (!url) {
    renderPhotoPreview();
    return;
  }

  renderPhotoPreview(url);
}

function renderPhotoPreview(imageSource = state.selectedPhotoDataUrl || sanitizeImageUrl(photoUrlInput.value)) {
  if (!imageSource) {
    photoPreviewContainer.hidden = true;
    photoPreviewContainer.innerHTML = '';
    updatePhotoStatusBadge(false);
    return;
  }

  photoPreviewContainer.innerHTML = `<img src="${escapeAttribute(imageSource)}" alt="Incident preview" />`;
  photoPreviewContainer.hidden = false;
  updatePhotoStatusBadge(Boolean(imageSource));
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
  if (status === 'Pending Trail Match') return 'pending-match';
  return 'flagged';
}

function toTypeClass(type) {
  if (type === 'Trail Hazard') return 'flagged';
  if (type === 'Invasive Species') return 'reported';
  if (type === 'Infrastructure/Trash') return 'resolved';
  return 'low';
}

function parseGpsCoordinates(gpsValue) {
  const value = String(gpsValue || '').trim();
  if (!value) return null;

  const [latitudeRaw, longitudeRaw] = value.split(',').map((part) => part && part.trim());
  if (!latitudeRaw || !longitudeRaw) return null;

  const latitude = Number(latitudeRaw);
  const longitude = Number(longitudeRaw);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return { latitude, longitude };
}

function handleGpxExport() {
  const incidentsWithCoordinates = state.incidents
    .map((incident) => {
      const coordinates = parseGpsCoordinates(incident.gps);
      if (!coordinates) return null;
      return { ...incident, ...coordinates };
    })
    .filter(Boolean);

  if (!incidentsWithCoordinates.length) {
    window.alert('No incidents with valid GPS coordinates are available for GPX export.');
    return;
  }

  const sortedByDate = incidentsWithCoordinates
    .slice()
    .sort((left, right) => String(left.date || '').localeCompare(String(right.date || '')));

  const waypointEntries = sortedByDate
    .map((incident) => {
      const timestamp = toIsoTimestamp(incident.date);
      const waypointName = escapeXml(incident.trailName || incident.location || incident.type || 'Field Incident');
      const description = escapeXml(`${incident.type} | ${incident.priority} | ${incident.status} | Mile ${incident.mileMarker || 'N/A'}`);
      return [
        `  <wpt lat="${incident.latitude}" lon="${incident.longitude}">`,
        `    <name>${waypointName}</name>`,
        `    <desc>${description}</desc>`,
        `    <time>${timestamp}</time>`,
        '  </wpt>'
      ].join('\n');
    })
    .join('\n');

  const trackEntries = sortedByDate
    .map((incident) => {
      const timestamp = toIsoTimestamp(incident.date);
      return [
        `      <trkpt lat="${incident.latitude}" lon="${incident.longitude}">`,
        `        <time>${timestamp}</time>`,
        '      </trkpt>'
      ].join('\n');
    })
    .join('\n');

  const gpxContent = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="East Bay Field & Trail Condition Tracker" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <metadata>',
    '    <name>Field Incident Trail Export</name>',
    `    <time>${new Date().toISOString()}</time>`,
    '  </metadata>',
    waypointEntries,
    '  <trk>',
    '    <name>Logged Field Incidents</name>',
    '    <trkseg>',
    trackEntries,
    '    </trkseg>',
    '  </trk>',
    '</gpx>'
  ].join('\n');

  const gpxBlob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const downloadUrl = URL.createObjectURL(gpxBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = `field-incidents-${new Date().toISOString().slice(0, 10)}.gpx`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
}

async function handleGpxImport(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  try {
    const gpxContent = await file.text();
    const importedIncidents = parseGpxContent(gpxContent);

    if (!importedIncidents.length) {
      window.alert('No valid waypoints or track points were found in this GPX file.');
      return;
    }

    state.incidents = importedIncidents.concat(state.incidents).map(normalizeIncident);
    state.editingIncidentId = null;
    persistIncidents();
    renderDashboard();
    renderTable();
    renderResumeOutput();
    window.alert(`Imported ${importedIncidents.length} trail points from GPX.`);
  } catch (error) {
    console.error('GPX import failed:', error);
    window.alert('Unable to import GPX file. Please verify the file format and try again.');
  } finally {
    importGpxInput.value = '';
  }
}

function parseGpxContent(gpxContent) {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(gpxContent, 'application/xml');
  if (xmlDocument.querySelector('parsererror')) {
    return [];
  }

  const waypoints = Array.from(xmlDocument.querySelectorAll('wpt'))
    .map((node, index) => createIncidentFromGpxNode(node, index, 'Waypoint'))
    .filter(Boolean);

  const trackPoints = Array.from(xmlDocument.querySelectorAll('trkpt'))
    .map((node, index) => createIncidentFromGpxNode(node, index, 'Track Point'))
    .filter(Boolean);

  const deduplicated = [];
  const seen = new Set();

  [...waypoints, ...trackPoints].forEach((incident) => {
    const key = `${incident.gps}|${incident.date}|${incident.trailName}`;
    if (seen.has(key)) return;
    seen.add(key);
    deduplicated.push(incident);
  });

  return deduplicated;
}

function createIncidentFromGpxNode(node, index, pointType) {
  const latitude = Number(node.getAttribute('lat'));
  const longitude = Number(node.getAttribute('lon'));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const nameNode = node.querySelector('name');
  const descNode = node.querySelector('desc');
  const timeNode = node.querySelector('time');
  const label = nameNode ? nameNode.textContent.trim() : `${pointType} ${index + 1}`;
  const description = descNode ? descNode.textContent.trim() : '';
  const mileMarker = extractMileMarker(description);
  const dateValue = normalizeDateFromTimestamp(timeNode ? timeNode.textContent.trim() : '');
  const gpsValue = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  return normalizeIncident({
    id: `imported-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`,
    type: 'Trail Hazard',
    location: label || `${pointType} ${index + 1}`,
    trailName: label || '',
    mileMarker,
    priority: 'Medium',
    status: 'Pending Trail Match',
    gps: gpsValue,
    date: dateValue,
    photo: ''
  });
}

function extractMileMarker(descriptionText) {
  const match = String(descriptionText || '').match(/mile(?:\s*marker)?[:\s]+([0-9]+(?:\.[0-9]+)?)/i);
  return match ? match[1] : '';
}

function normalizeDateFromTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function toIsoTimestamp(dateValue) {
  const value = String(dateValue || '').trim();
  if (!value) return new Date().toISOString();

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
