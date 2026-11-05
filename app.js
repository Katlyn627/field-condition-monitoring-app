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
const locationInput = document.getElementById('location');
const photoUrlInput = document.getElementById('photoUrl');
const photoInput = document.getElementById('photoInput');
const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const resumeOutput = document.getElementById('resumeOutput');
const copyResumeButton = document.getElementById('copyResumeButton');
const clearFormButton = document.getElementById('clearFormButton');
const exportGpxButton = document.getElementById('exportGpxButton');
const gpsInput = document.getElementById('gps');
const gpsLocationButton = document.getElementById('gpsLocationButton');
const gpsStatusBadge = document.getElementById('gpsStatusBadge');
const photoStatusBadge = document.getElementById('photoStatusBadge');
const offlineStatus = document.getElementById('offlineStatus');

const state = {
  incidents: loadIncidents(),
  selectedPhotoDataUrl: ''
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
}

function attachEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  statusFilter.addEventListener('change', renderTable);
  typeFilter.addEventListener('change', renderTable);
  photoUrlInput.addEventListener('input', () => {
    state.selectedPhotoDataUrl = '';
    handlePhotoPreview();
  });
  photoInput.addEventListener('change', handlePhotoUpload);
  copyResumeButton.addEventListener('click', copyResumeBullets);
  clearFormButton.addEventListener('click', clearIncidentForm);
  exportGpxButton.addEventListener('click', handleGpxExport);
  tableBody.addEventListener('click', handleTableAction);
  gpsInput.addEventListener('input', () => {
    updateGpsStatusBadge(Boolean(gpsInput.value.trim()) && gpsInput.value !== 'Location unavailable');
  });
  gpsLocationButton.addEventListener('click', handleGeolocationCapture);
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
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
  gpsStatusBadge.textContent = hasCoordinates ? 'GPS ready' : 'GPS ready';
}

function updatePhotoStatusBadge(hasPhoto) {
  if (!photoStatusBadge) return;
  photoStatusBadge.hidden = !hasPhoto;
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
      const formattedLatitude = latitude.toFixed(5);
      const formattedLongitude = longitude.toFixed(5);
      gpsInput.value = `${formattedLatitude}, ${formattedLongitude}`;
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
      const hasGpsCoordinates = Boolean(parseGpsCoordinates(incident.gps));
      const mapButton = hasGpsCoordinates
        ? `<button class="table-button" data-action="map" data-id="${escapeAttribute(incident.id)}">View on Map</button>`
        : '<button class="table-button" disabled title="Add valid GPS coordinates to use map view">View on Map</button>';

      const priorityClass = toPriorityClass(incident.priority);
      const statusClass = toStatusClass(incident.status);
      const actionLabel = incident.status === 'Resolved' ? 'Reopen' : 'Resolve';

      return `
        <tr>
          <td data-label="Type"><span class="badge ${toTypeClass(incident.type)}">${safeType}</span></td>
          <td data-label="Location">${safeLocation}</td>
          <td data-label="Priority"><span class="badge ${priorityClass}">${safePriority}</span></td>
          <td data-label="Status"><span class="badge ${statusClass}">${safeStatus}</span></td>
          <td data-label="GPS">${safeGps}</td>
          <td data-label="Date">${safeDate}</td>
          <td data-label="Photo">${photoCell}</td>
          <td data-label="Actions">
            <div class="actions">
              ${mapButton}
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

  if (action === 'map') {
    openIncidentInMap(incident);
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
    photo: getSelectedPhotoValue()
  };

  if (!incident.location) {
    return;
  }

  state.incidents.unshift(incident);
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

function openIncidentInMap(incident) {
  const coordinates = parseGpsCoordinates(incident.gps);
  if (!coordinates) {
    return;
  }

  const mapUrl = getMapDeepLink(coordinates.latitude, coordinates.longitude);
  if (mapUrl.startsWith('geo:')) {
    window.location.href = mapUrl;
    return;
  }
  window.open(mapUrl, '_blank', 'noopener');
}

function getMapDeepLink(latitude, longitude) {
  const formattedLatitude = Number(latitude).toFixed(6);
  const formattedLongitude = Number(longitude).toFixed(6);
  const isAndroidMobile = /Android/i.test(navigator.userAgent);

  if (isAndroidMobile) {
    return `geo:${formattedLatitude},${formattedLongitude}`;
  }

  return `https://www.google.com/maps?q=${formattedLatitude},${formattedLongitude}`;
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
      const waypointName = escapeXml(incident.location || incident.type || 'Field Incident');
      const description = escapeXml(`${incident.type} | ${incident.priority} | ${incident.status}`);
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

function toIsoTimestamp(dateValue) {
  const value = String(dateValue || '').trim();
  if (!value) return new Date().toISOString();

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
