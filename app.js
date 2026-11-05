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
    date: '2026-10-29',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    notes: 'Rockfall narrowed trail corridor to one-person passage; temporary caution marker installed.'
  },
  {
    id: 'sample-2',
    type: 'Invasive Species',
    location: 'North Ridge Trail, Redwood Regional Park',
    trailName: 'North Ridge Trail',
    mileMarker: '1.4',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.8222, -122.1887',
    date: '2026-10-28',
    photo: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
    notes: 'French broom patch spreading along slope edge; removal team recommended before seed set.'
  },
  {
    id: 'sample-3',
    type: 'Infrastructure/Trash',
    location: 'Morrison Canyon, Mt. Diablo State Park',
    trailName: 'Morrison Canyon Road',
    mileMarker: '0.8',
    priority: 'Immediate Safety Hazard',
    status: 'Reported to District',
    gps: '37.8819, -121.9188',
    date: '2026-10-27',
    photo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    notes: 'Washout undermined trail shoulder near culvert crossing; access partially blocked.'
  },
  {
    id: 'sample-4',
    type: 'Wildlife Impact',
    location: 'Lake Anza Loop, Tilden Regional Park',
    trailName: 'Lake Anza Trail',
    mileMarker: '0.6',
    priority: 'Low',
    status: 'Resolved',
    gps: '37.8998, -122.2491',
    date: '2026-10-26',
    photo: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80',
    notes: 'Shoreline nesting area signed and rerouted; foot traffic compliance improved.'
  },
  {
    id: 'sample-5',
    type: 'Trail Hazard',
    location: 'Del Valle South Trailhead, Del Valle Regional Park',
    trailName: 'East Shore Trail',
    mileMarker: '2.9',
    priority: 'High',
    status: 'Flagged',
    gps: '37.6042, -121.7001',
    date: '2026-10-25',
    photo: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80',
    notes: 'Rutted switchback after weekend rainfall; hikers bypassing onto fragile shoulder.'
  },
  {
    id: 'sample-6',
    type: 'Infrastructure/Trash',
    location: 'Sunol Wilderness Visitor Center',
    trailName: 'Indian Joe Nature Trail',
    mileMarker: '0.2',
    priority: 'Medium',
    status: 'Resolved',
    gps: '37.5147, -121.8309',
    date: '2026-10-24',
    photo: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=900&q=80',
    notes: 'Overflowing waste station serviced; replacement signage added for pack-out reminders.'
  },
  {
    id: 'sample-7',
    type: 'Invasive Species',
    location: 'Nimitz Way Staging Area, Tilden Regional Park',
    trailName: 'Nimitz Way',
    mileMarker: '1.1',
    priority: 'Medium',
    status: 'Pending Trail Match',
    gps: '37.8892, -122.2376',
    date: '2026-10-23',
    photo: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    notes: 'Poison hemlock cluster observed near drainage swale; monitoring markers placed.'
  },
  {
    id: 'sample-8',
    type: 'Trail Hazard',
    location: 'Skyline Gate, Redwood Regional Park',
    trailName: 'West Ridge Trail',
    mileMarker: '0.9',
    priority: 'High',
    status: 'Reported to District',
    gps: '37.8119, -122.1899',
    date: '2026-10-22',
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
    notes: 'Downed eucalyptus limb suspended over trail; flagged for chainsaw crew.'
  },
  {
    id: 'sample-9',
    type: 'Wildlife Impact',
    location: 'Briones Bear Creek Trailhead',
    trailName: 'Bear Creek Trail',
    mileMarker: '1.7',
    priority: 'Low',
    status: 'Flagged',
    gps: '37.9146, -122.1510',
    date: '2026-10-21',
    photo: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
    notes: 'Seasonal pond crossing used by amphibians; volunteer education signage requested.'
  },
  {
    id: 'sample-10',
    type: 'Infrastructure/Trash',
    location: 'Wildcat Canyon Road Pullout',
    trailName: 'Wildcat Gorge Trail',
    mileMarker: '3.4',
    priority: 'Medium',
    status: 'Resolved',
    gps: '37.9048, -122.2594',
    date: '2026-10-20',
    photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    notes: 'Illicit dumping removed (8 bags + lumber scraps); ranger patrol frequency increased.'
  },
  {
    id: 'sample-11',
    type: 'Trail Hazard',
    location: 'Las Trampas Bollinger Staging Area',
    trailName: 'Rocky Ridge View Trail',
    mileMarker: '2.2',
    priority: 'Immediate Safety Hazard',
    status: 'Reported to District',
    gps: '37.7785, -121.9780',
    date: '2026-10-19',
    photo: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=900&q=80',
    notes: 'Fence failure at steep slope edge; temporary closure cones placed.'
  },
  {
    id: 'sample-12',
    type: 'Invasive Species',
    location: 'Sycamore Valley Trail Junction',
    trailName: 'Sycamore Valley Trail',
    mileMarker: '1.0',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.8324, -121.9908',
    date: '2026-10-18',
    photo: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
    notes: 'Himalayan blackberry encroachment reducing tread width by roughly 40%.'
  },
  {
    id: 'sample-13',
    type: 'Wildlife Impact',
    location: 'Mission Peak Ohlone College Entrance',
    trailName: 'Peak Meadow Trail',
    mileMarker: '2.6',
    priority: 'Low',
    status: 'Pending Trail Match',
    gps: '37.5237, -121.8853',
    date: '2026-10-17',
    photo: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80',
    notes: 'Ground squirrel burrowing near switchback retaining edge; monitor for erosion impacts.'
  },
  {
    id: 'sample-14',
    type: 'Infrastructure/Trash',
    location: 'Crown Beach Dune Access',
    trailName: 'Shoreline Access Path',
    mileMarker: '0.4',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.7578, -122.2579',
    date: '2026-10-16',
    photo: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80',
    notes: 'Boardwalk handrail loose on north segment; needs hardware tightening and inspection.'
  },
  {
    id: 'sample-15',
    type: 'Trail Hazard',
    location: 'Sibley Volcanic Preserve Round Top',
    trailName: 'Round Top Loop',
    mileMarker: '1.9',
    priority: 'High',
    status: 'Resolved',
    gps: '37.8533, -122.1976',
    date: '2026-10-15',
    photo: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=900&q=80',
    notes: 'Loose scree section stabilized with brushed drainage channel and hazard marker.'
  },
  {
    id: 'sample-16',
    type: 'Invasive Species',
    location: 'Miller/Knox Ferry Point',
    trailName: 'Bay View Trail',
    mileMarker: '0.7',
    priority: 'Low',
    status: 'Resolved',
    gps: '37.9270, -122.3790',
    date: '2026-10-14',
    photo: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80',
    notes: 'Iceplant patch trimmed back from trail edge; native planting zone protected.'
  },
  {
    id: 'sample-17',
    type: 'Infrastructure/Trash',
    location: 'Pleasanton Ridge Foothill Staging',
    trailName: 'Oak Tree Trail',
    mileMarker: '3.0',
    priority: 'High',
    status: 'Reported to District',
    gps: '37.6658, -121.8895',
    date: '2026-10-13',
    photo: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80',
    notes: 'Broken cattle-gate latch causing livestock bypass onto trail corridor.'
  },
  {
    id: 'sample-18',
    type: 'Wildlife Impact',
    location: 'Anthony Chabot Big Bear Gate',
    trailName: 'Brandon Trail',
    mileMarker: '2.4',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.7726, -122.1132',
    date: '2026-10-12',
    photo: 'https://images.unsplash.com/photo-1469122312224-c5846569feb1?auto=format&fit=crop&w=900&q=80',
    notes: 'Repeated coyote den activity near trail shoulder; advisory sign requested.'
  },
  {
    id: 'sample-19',
    type: 'Trail Hazard',
    location: 'Reinhardt Redwood Canyon Gate',
    trailName: 'Stream Trail',
    mileMarker: '1.3',
    priority: 'Medium',
    status: 'Resolved',
    gps: '37.8205, -122.1833',
    date: '2026-10-11',
    photo: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=80',
    notes: 'Small bridge decking slick with algae; anti-slip treatment applied.'
  },
  {
    id: 'sample-20',
    type: 'Invasive Species',
    location: 'Black Diamond Mines Somersville',
    trailName: 'Chaparral Loop',
    mileMarker: '2.8',
    priority: 'High',
    status: 'Pending Trail Match',
    gps: '37.9508, -121.8726',
    date: '2026-10-10',
    photo: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=900&q=80',
    notes: 'Yellow starthistle bloom expanding in old fire scar; treatment window urgent.'
  },
  {
    id: 'sample-21',
    type: 'Infrastructure/Trash',
    location: 'Coyote Hills Quarry Staging',
    trailName: 'Bayview Trail',
    mileMarker: '0.5',
    priority: 'Low',
    status: 'Resolved',
    gps: '37.5588, -122.0902',
    date: '2026-10-09',
    photo: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=900&q=80',
    notes: 'Picnic area litter sweep completed; bins now include wildlife-safe lids.'
  },
  {
    id: 'sample-22',
    type: 'Wildlife Impact',
    location: 'Sunol Little Yosemite Trailhead',
    trailName: 'Little Yosemite Trail',
    mileMarker: '4.1',
    priority: 'Medium',
    status: 'Reported to District',
    gps: '37.5487, -121.8586',
    date: '2026-10-08',
    photo: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80',
    notes: 'Sensitive riparian corridor trampling observed; rope boundary reinforcement needed.'
  },
  {
    id: 'sample-23',
    type: 'Trail Hazard',
    location: 'Briones Alhambra Creek Entrance',
    trailName: 'Alhambra Creek Trail',
    mileMarker: '1.6',
    priority: 'High',
    status: 'Flagged',
    gps: '37.9453, -122.1217',
    date: '2026-10-07',
    photo: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=900&q=80',
    notes: 'Seasonal creek crossing undercut by flow; temporary bypass route marked.'
  },
  {
    id: 'sample-24',
    type: 'Invasive Species',
    location: 'Tilden Inspiration Point',
    trailName: 'Wildcat Peak Trail',
    mileMarker: '0.7',
    priority: 'Low',
    status: 'Resolved',
    gps: '37.9090, -122.2448',
    date: '2026-10-06',
    photo: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=80',
    notes: 'Pampas grass seedlings removed from overlook edge before root establishment.'
  },
  {
    id: 'sample-25',
    type: 'Infrastructure/Trash',
    location: 'Del Valle East Beach Access',
    trailName: 'Lakeside Trail',
    mileMarker: '1.2',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.5964, -121.7095',
    date: '2026-10-05',
    photo: 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=900&q=80',
    notes: 'Damaged directional post and graffiti on restroom wall; maintenance ticket opened.'
  },
  {
    id: 'sample-26',
    type: 'Wildlife Impact',
    location: 'Redwood Moon Gate',
    trailName: 'French Trail',
    mileMarker: '2.3',
    priority: 'Low',
    status: 'Resolved',
    gps: '37.8161, -122.1768',
    date: '2026-10-04',
    photo: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    notes: 'Large woodpecker cavity tree fenced from off-trail approach to reduce disturbance.'
  },
  {
    id: 'sample-27',
    type: 'Trail Hazard',
    location: 'Mount Diablo Mitchell Canyon',
    trailName: 'Mitchell Canyon Fire Road',
    mileMarker: '3.5',
    priority: 'Immediate Safety Hazard',
    status: 'Reported to District',
    gps: '37.9133, -121.9450',
    date: '2026-10-03',
    photo: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=900&q=80',
    notes: 'Deep axle-width rut creates fall risk for cyclists descending at speed.'
  },
  {
    id: 'sample-28',
    type: 'Invasive Species',
    location: 'Alvarado Staging Area, Wildcat Canyon',
    trailName: 'Meadows Canyon Trail',
    mileMarker: '1.5',
    priority: 'Medium',
    status: 'Flagged',
    gps: '37.9638, -122.2873',
    date: '2026-10-02',
    photo: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80',
    notes: 'Arundo donax stand expanding along channel bank; notify restoration team.'
  },
  {
    id: 'sample-29',
    type: 'Infrastructure/Trash',
    location: 'Carquinez Strait Staging',
    trailName: 'Franklin Ridge Trail',
    mileMarker: '0.9',
    priority: 'High',
    status: 'Pending Trail Match',
    gps: '38.0180, -122.1979',
    date: '2026-10-01',
    photo: 'https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=900&q=80',
    notes: 'Trail railing segment detached near bluff edge; temporary tape line installed.'
  },
  {
    id: 'sample-30',
    type: 'Wildlife Impact',
    location: 'Point Pinole Giant Highway',
    trailName: 'Bay Trail Spur',
    mileMarker: '2.0',
    priority: 'Medium',
    status: 'Reported to District',
    gps: '37.9959, -122.3593',
    date: '2026-09-30',
    photo: 'https://images.unsplash.com/photo-1429087969512-1e85aab2683d?auto=format&fit=crop&w=900&q=80',
    notes: 'Shorebird congregation near tidal flats requires short-term leash enforcement signage.'
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
const page = document.body.dataset.page || 'home';

const state = {
  incidents: loadIncidents(),
  selectedPhotoDataUrl: '',
  editingIncidentId: null
};

const LOCAL_TRAILHEADS = [
  { name: 'Sunset Trailhead, Tilden Regional Park', latitude: 37.8966, longitude: -122.2484, agency: 'EBRPD' },
  { name: 'North Ridge Trailhead, Redwood Regional Park', latitude: 37.8222, longitude: -122.1887, agency: 'EBRPD' },
  { name: 'Morrison Canyon, Mt. Diablo State Park', latitude: 37.8819, longitude: -121.9188, agency: 'CA State Parks' },
  { name: 'Del Valle South Trailhead, Del Valle Regional Park', latitude: 37.6042, longitude: -121.7001, agency: 'EBRPD' },
  { name: 'Sunol Wilderness Visitor Center', latitude: 37.5147, longitude: -121.8309, agency: 'EBRPD' }
];

const WEATHER_CODE_LABELS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

initialize();

function initialize() {
  ensureFieldAssistUi();
  setDefaultDate();
  attachEventListeners();
  updateConnectionStatus();
  updateGpsStatusBadge(Boolean(gpsInput && gpsInput.value.trim()));
  updatePhotoStatusBadge(Boolean(state.selectedPhotoDataUrl || (photoUrlInput && photoUrlInput.value.trim())));
  renderDashboard();
  renderTable();
  renderResumeOutput();
}

function attachEventListeners() {
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', renderTable);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', renderTable);
  }

  if (pendingTrailMatchInput) {
    pendingTrailMatchInput.addEventListener('change', handlePendingTrailMatchToggle);
  }

  if (photoUrlInput) {
    photoUrlInput.addEventListener('input', () => {
      state.selectedPhotoDataUrl = '';
      handlePhotoPreview();
    });
  }

  if (photoInput) {
    photoInput.addEventListener('change', handlePhotoUpload);
  }

  if (copyResumeButton) {
    copyResumeButton.addEventListener('click', copyResumeBullets);
  }

  if (clearFormButton) {
    clearFormButton.addEventListener('click', clearIncidentForm);
  }

  if (exportGpxButton) {
    exportGpxButton.addEventListener('click', handleGpxExport);
  }

  if (importGpxButton && importGpxInput) {
    importGpxButton.addEventListener('click', () => importGpxInput.click());
    importGpxInput.addEventListener('change', handleGpxImport);
  }

  if (tableBody) {
    tableBody.addEventListener('click', handleTableAction);
    tableBody.addEventListener('submit', handleInlineEditSubmit);
  }

  if (gpsInput) {
    gpsInput.addEventListener('input', () => {
      updateGpsStatusBadge(Boolean(gpsInput.value.trim()) && gpsInput.value !== 'Location unavailable');
    });
  }

  if (gpsLocationButton) {
    gpsLocationButton.addEventListener('click', handleGeolocationCapture);
  }

  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

function ensureFieldAssistUi() {
  if (!form) return;

  const fieldGrid = form.querySelector('.field-grid');
  if (!fieldGrid) return;

  ensureNotesField(fieldGrid);
  ensureElevationBadge();
  ensureNearbyObservationsField(fieldGrid);
}

function ensureNotesField(fieldGrid) {
  if (document.getElementById('incidentNotes')) return;

  const notesLabel = document.createElement('label');
  notesLabel.className = 'full-width';
  notesLabel.innerHTML = `
    <span>Incident Notes</span>
    <textarea id="incidentNotes" name="notes" rows="4" placeholder="Notes from weather, terrain, species, and field observations."></textarea>
  `;

  const photoUrlLabel = photoUrlInput ? photoUrlInput.closest('label') : null;
  if (photoUrlLabel) {
    fieldGrid.insertBefore(notesLabel, photoUrlLabel);
    return;
  }

  fieldGrid.appendChild(notesLabel);
}

function ensureElevationBadge() {
  if (!gpsStatusBadge || document.getElementById('elevationBadge')) return;

  const elevationBadge = document.createElement('span');
  elevationBadge.id = 'elevationBadge';
  elevationBadge.className = 'gps-flag';
  elevationBadge.textContent = 'Elevation: --';
  elevationBadge.hidden = true;
  gpsStatusBadge.insertAdjacentElement('afterend', elevationBadge);
}

function ensureNearbyObservationsField(fieldGrid) {
  if (document.getElementById('nearbyObservationsSelect')) return;

  const observationsLabel = document.createElement('label');
  observationsLabel.className = 'full-width';
  observationsLabel.innerHTML = `
    <span>Nearby species reports (iNaturalist, 2 km)</span>
    <select id="nearbyObservationsSelect" name="nearbyObservation">
      <option value="">No nearby observations loaded yet.</option>
    </select>
  `;

  fieldGrid.appendChild(observationsLabel);
}

function handlePendingTrailMatchToggle() {
  const statusInput = document.getElementById('status');
  if (!statusInput || !pendingTrailMatchInput) return;

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
  if (!dateInput) return;
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

function handleGeolocationCapture() {
  if (!('geolocation' in navigator)) {
    gpsInput.value = 'Geolocation unavailable';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = Number(position.coords.latitude);
      const longitude = Number(position.coords.longitude);
      gpsInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      updateGpsStatusBadge(true);

      const trailheadName = findNearestTrailhead(latitude, longitude);
      if (trailheadName && locationInput) {
        locationInput.value = trailheadName;
      }

      enrichLocationContext(latitude, longitude);
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

function enrichLocationContext(latitude, longitude) {
  if (!navigator.onLine) {
    setNearbyObservationsPlaceholder('Offline mode: nearby observations unavailable.');
    return;
  }

  fetchLocationWeather(latitude, longitude)
    .then((weather) => {
      if (!weather) return;
      appendWeatherToNotes(weather);
    })
    .catch(() => null);

  fetchUSGSElevation(latitude, longitude)
    .then((elevationFeet) => {
      if (!Number.isFinite(elevationFeet)) return;
      setElevationBadge(elevationFeet);
    })
    .catch(() => null);

  fetchNearbyObservations(latitude, longitude)
    .then((observations) => {
      renderNearbyObservations(observations);
    })
    .catch(() => {
      setNearbyObservationsPlaceholder('Unable to load nearby observations right now.');
    });
}

async function fetchLocationWeather(lat, lng) {
  if (!navigator.onLine) return null;

  const requestUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current_weather=true`;

  return fetch(requestUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Weather lookup failed');
      return response.json();
    })
    .then((payload) => {
      const weather = payload && payload.current_weather ? payload.current_weather : null;
      if (!weather) return null;

      const temperatureC = Number(weather.temperature);
      const weatherCode = Number(weather.weathercode);
      const condition = WEATHER_CODE_LABELS[weatherCode] || 'Unknown conditions';

      if (!Number.isFinite(temperatureC)) return null;
      return {
        temperatureC,
        condition
      };
    })
    .catch(() => null);
}

async function fetchUSGSElevation(lat, lng) {
  if (!navigator.onLine) return null;

  const requestUrl = `https://epqs.nationalmap.gov/v1/json?x=${encodeURIComponent(lng)}&y=${encodeURIComponent(lat)}&wkid=4326&units=Feet`;

  return fetch(requestUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Elevation lookup failed');
      return response.json();
    })
    .then((payload) => {
      const elevation =
        payload && payload.value != null ? payload.value :
        payload && payload.elevation != null ? payload.elevation :
        payload && payload.USGS_Elevation_Point_Query_Service &&
          payload.USGS_Elevation_Point_Query_Service.Elevation_Query &&
          payload.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation != null
          ? payload.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation
          : null;

      const elevationFeet = Number(elevation);
      return Number.isFinite(elevationFeet) ? elevationFeet : null;
    })
    .catch(() => null);
}

async function fetchNearbyObservations(lat, lng) {
  if (!navigator.onLine) return [];

  const requestUrl = `https://api.inaturalist.org/v1/observations?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=2&per_page=5`;

  return fetch(requestUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Nearby observations lookup failed');
      return response.json();
    })
    .then((payload) => {
      const results = Array.isArray(payload && payload.results) ? payload.results : [];

      return results.map((entry) => {
        const taxon = entry && entry.taxon ? entry.taxon : {};
        const speciesName = taxon.preferred_common_name || taxon.name || 'Unidentified species';
        const observedOn = entry && entry.observed_on ? entry.observed_on : '';
        return {
          speciesName: String(speciesName),
          observedOn: String(observedOn)
        };
      });
    })
    .catch(() => []);
}

function appendWeatherToNotes(weather) {
  const notesInput = document.getElementById('incidentNotes');
  if (!notesInput) return;

  const weatherSummary = `Weather: ${weather.temperatureC.toFixed(1)}°C, ${weather.condition}`;
  const currentNotes = notesInput.value.trim();

  if (currentNotes.includes(weatherSummary)) return;
  notesInput.value = currentNotes ? `${currentNotes}\n${weatherSummary}` : weatherSummary;
}

function setElevationBadge(elevationFeet) {
  const elevationBadge = document.getElementById('elevationBadge');
  if (!elevationBadge) return;

  elevationBadge.textContent = `Elevation: ${Math.round(elevationFeet).toLocaleString()} ft`;
  elevationBadge.hidden = false;
}

function setNearbyObservationsPlaceholder(text) {
  const observationsSelect = document.getElementById('nearbyObservationsSelect');
  if (!observationsSelect) return;

  observationsSelect.innerHTML = `<option value="">${escapeHtml(text)}</option>`;
}

function renderNearbyObservations(observations) {
  const observationsSelect = document.getElementById('nearbyObservationsSelect');
  if (!observationsSelect) return;

  if (!Array.isArray(observations) || !observations.length) {
    setNearbyObservationsPlaceholder('No nearby observations found.');
    return;
  }

  const optionsMarkup = observations
    .map((item) => {
      const species = escapeHtml(item.speciesName || 'Unidentified species');
      const observedLabel = item.observedOn ? ` (${escapeHtml(item.observedOn)})` : '';
      return `<option value="${species}">${species}${observedLabel}</option>`;
    })
    .join('');

  observationsSelect.innerHTML = `<option value="">Select a nearby species report</option>${optionsMarkup}`;
}

function findNearestTrailhead(userLat, userLng) {
  let closestTrailhead = null;
  let shortestDistance = Infinity;

  LOCAL_TRAILHEADS.forEach((trailhead) => {
    const distanceKm = calculateDistanceKm(userLat, userLng, trailhead.latitude, trailhead.longitude);
    if (distanceKm < shortestDistance) {
      shortestDistance = distanceKm;
      closestTrailhead = trailhead;
    }
  });

  return shortestDistance <= 3 ? closestTrailhead.name : null;
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
  const priorityWatch = state.incidents.filter((item) => {
    return item.priority === 'High' || item.priority === 'Immediate Safety Hazard';
  }).length;
  const needsReview = state.incidents.filter((item) => item.status !== 'Resolved').length;
  const latestDate = state.incidents
    .map((item) => item.date)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  const totalIncidentsElement = document.getElementById('totalIncidents');
  const pendingWorkElement = document.getElementById('pendingWork');
  const resolvedItemsElement = document.getElementById('resolvedItems');
  const volunteerHoursElement = document.getElementById('volunteerHours');
  const priorityWatchElement = document.getElementById('priorityWatch');
  const needsReviewElement = document.getElementById('needsReview');
  const lastIncidentDateElement = document.getElementById('lastIncidentDate');

  if (totalIncidentsElement) totalIncidentsElement.textContent = total;
  if (pendingWorkElement) pendingWorkElement.textContent = pending;
  if (resolvedItemsElement) resolvedItemsElement.textContent = resolved;
  if (volunteerHoursElement) volunteerHoursElement.textContent = volunteerHours.toFixed(1);
  if (priorityWatchElement) priorityWatchElement.textContent = priorityWatch;
  if (needsReviewElement) needsReviewElement.textContent = needsReview;
  if (lastIncidentDateElement) lastIncidentDateElement.textContent = latestDate ? formatDate(latestDate) : '—';

  renderHeroData({
    total,
    pending,
    resolved,
    priorityWatch,
    latestDate
  });
  renderHomeCharts(total);
}

function renderHeroData(metrics) {
  const heroStatCards = document.getElementById('heroStatCards');
  const heroMapCards = document.getElementById('heroMapCards');
  const heroPhotoCards = document.getElementById('heroPhotoCards');

  if (heroStatCards) {
    heroStatCards.innerHTML = [
      createHeroStatItem('Logged', metrics.total),
      createHeroStatItem('Open', metrics.pending),
      createHeroStatItem('Resolved', metrics.resolved),
      createHeroStatItem('High risk', metrics.priorityWatch)
    ].join('');
  }

  if (heroMapCards) {
    const mapReadyIncidents = state.incidents
      .filter((incident) => parseGpsCoordinates(incident.gps))
      .slice(0, 3);

    if (!mapReadyIncidents.length) {
      heroMapCards.innerHTML = '<p class="empty-state">No GPS points yet. Add coordinates in the log page.</p>';
    } else {
      heroMapCards.innerHTML = mapReadyIncidents
        .map((incident) => {
          const coordinates = parseGpsCoordinates(incident.gps);
          const mapLink = getGoogleMapsDeepLink(coordinates.latitude, coordinates.longitude);
          const safeLocation = escapeHtml(incident.location || 'Unlabeled location');
          const safeStatus = escapeHtml(incident.status || 'Flagged');
          const safeDate = escapeHtml(formatDate(incident.date));

          return `
            <a class="hero-map-item" href="${escapeAttribute(mapLink)}" target="_blank" rel="noopener">
              <strong>${safeLocation}</strong>
              <span>${safeStatus} • ${safeDate}</span>
            </a>
          `;
        })
        .join('');
    }
  }

  if (heroPhotoCards) {
    const photoIncidents = state.incidents
      .filter((incident) => Boolean(sanitizeImageUrl(incident.photo)))
      .slice(0, 3);

    if (!photoIncidents.length) {
      heroPhotoCards.innerHTML = '<p class="empty-state">No photos yet. Add image URLs or uploads in new logs.</p>';
    } else {
      heroPhotoCards.innerHTML = photoIncidents
        .map((incident) => {
          const safePhoto = escapeAttribute(sanitizeImageUrl(incident.photo));
          const safeAlt = escapeAttribute(`${incident.location || incident.type} photo`);
          const safeLocation = escapeHtml(incident.location || 'Unlabeled location');
          const safeDate = escapeHtml(formatDate(incident.date));

          return `
            <article class="hero-photo-item">
              <img src="${safePhoto}" alt="${safeAlt}" />
              <div class="hero-photo-meta">
                <strong>${safeLocation}</strong>
                <span>${safeDate}</span>
              </div>
            </article>
          `;
        })
        .join('');
    }
  }
}

function createHeroStatItem(label, value) {
  return `
    <article class="hero-stat-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `;
}

function renderHomeCharts(totalIncidents) {
  const statusChartRows = document.getElementById('statusChartRows');
  const typeChartRows = document.getElementById('typeChartRows');
  const trendChartBars = document.getElementById('trendChartBars');
  const total = Math.max(0, Number(totalIncidents) || 0);

  if (statusChartRows) {
    const statusOrder = ['Flagged', 'Pending Trail Match', 'Reported to District', 'Resolved'];
    const statusRows = statusOrder.map((status) => {
      const count = state.incidents.filter((incident) => incident.status === status).length;
      const widthPercent = total ? Math.max(0, Math.round((count / total) * 100)) : 0;

      return `
        <div class="chart-row">
          <span class="chart-label">${escapeHtml(status)}</span>
          <span class="chart-value">${count}</span>
          <div class="chart-track" role="img" aria-label="${escapeAttribute(status)} incidents: ${count}">
            <span class="chart-fill status" style="width: ${widthPercent}%"></span>
          </div>
        </div>
      `;
    });

    statusChartRows.innerHTML = statusRows.join('');
  }

  if (typeChartRows) {
    const typeOrder = ['Trail Hazard', 'Invasive Species', 'Infrastructure/Trash', 'Wildlife Impact'];
    const typeRows = typeOrder.map((type) => {
      const count = state.incidents.filter((incident) => incident.type === type).length;
      const widthPercent = total ? Math.max(0, Math.round((count / total) * 100)) : 0;

      return `
        <div class="chart-row">
          <span class="chart-label">${escapeHtml(type)}</span>
          <span class="chart-value">${count}</span>
          <div class="chart-track" role="img" aria-label="${escapeAttribute(type)} incidents: ${count}">
            <span class="chart-fill type" style="width: ${widthPercent}%"></span>
          </div>
        </div>
      `;
    });

    typeChartRows.innerHTML = typeRows.join('');
  }

  if (trendChartBars) {
    const trendBins = buildRecentTrendBins(state.incidents, 7);
    const maxCount = trendBins.reduce((max, bin) => Math.max(max, bin.count), 0) || 1;

    trendChartBars.innerHTML = trendBins
      .map((bin) => {
        const heightPercent = bin.count > 0 ? Math.max(8, Math.round((bin.count / maxCount) * 100)) : 0;
        const safeLabel = escapeHtml(bin.label);
        const safeAriaLabel = escapeAttribute(`${bin.label}: ${bin.count} incidents`);

        return `
          <div class="trend-col" role="img" aria-label="${safeAriaLabel}">
            <div class="trend-bar">
              <span class="trend-fill" style="height: ${heightPercent}%"></span>
            </div>
            <span class="trend-count">${bin.count}</span>
            <span class="trend-label">${safeLabel}</span>
          </div>
        `;
      })
      .join('');
  }
}

function buildRecentTrendBins(incidents, days) {
  const validDays = Math.max(1, Number(days) || 7);
  const timestampedDates = incidents
    .map((incident) => parseIsoDate(incident.date))
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));
  const latestDate = timestampedDates.length ? new Date(Math.max(...timestampedDates.map((date) => date.getTime()))) : new Date();

  latestDate.setHours(0, 0, 0, 0);

  const countByKey = incidents.reduce((map, incident) => {
    const parsedDate = parseIsoDate(incident.date);
    if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
      return map;
    }

    const key = toLocalDateKey(parsedDate);
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});

  return Array.from({ length: validDays }, (_, index) => {
    const offset = validDays - 1 - index;
    const date = new Date(latestDate);
    date.setDate(date.getDate() - offset);

    const dateKey = toLocalDateKey(date);
    const label = `${date.getMonth() + 1}/${date.getDate()}`;

    return {
      label,
      count: countByKey[dateKey] || 0
    };
  });
}

function parseIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  if (!tableBody) return;

  const statusValue = statusFilter ? statusFilter.value : 'all';
  const typeValue = typeFilter ? typeFilter.value : 'all';

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
    photo: getSelectedPhotoValue(),
    notes: String(formData.get('notes') || '').trim()
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

  return photoUrlInput ? sanitizeImageUrl(photoUrlInput.value) : '';
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
  if (photoInput) photoInput.value = '';
  if (photoUrlInput) photoUrlInput.value = '';
  updatePhotoStatusBadge(false);
  renderPhotoPreview();
}

function clearIncidentForm() {
  if (form) form.reset();
  if (gpsInput) gpsInput.value = '';
  if (pendingTrailMatchInput) pendingTrailMatchInput.checked = false;
  updateGpsStatusBadge(false);
  clearElevationBadge();
  setNearbyObservationsPlaceholder('No nearby observations loaded yet.');
  resetPhotoSelection();
  setDefaultDate();
  handlePhotoPreview();
}

function clearElevationBadge() {
  const elevationBadge = document.getElementById('elevationBadge');
  if (!elevationBadge) return;
  elevationBadge.textContent = 'Elevation: --';
  elevationBadge.hidden = true;
}

function handlePhotoPreview() {
  if (state.selectedPhotoDataUrl) {
    renderPhotoPreview();
    return;
  }

  const url = photoUrlInput ? sanitizeImageUrl(photoUrlInput.value) : '';
  if (!url) {
    renderPhotoPreview();
    return;
  }

  renderPhotoPreview(url);
}

function renderPhotoPreview(imageSource = state.selectedPhotoDataUrl || (photoUrlInput ? sanitizeImageUrl(photoUrlInput.value) : '')) {
  if (!photoPreviewContainer) return;

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
  if (!resumeOutput) return;

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
