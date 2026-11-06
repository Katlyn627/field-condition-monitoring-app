const STORAGE_KEY = 'east-bay-condition-tracker';
const SEEDED_SAMPLE_VERSION = 2;
const SAMPLE_VERSION_KEY = `${STORAGE_KEY}-sample-version`;
const MAP_PREVIEW_SIZE = '640x360';

const sampleLogs = [
  {
    id: 'ebrpd-erosion-001',
    title: 'Severe Gully Erosion & Washout',
    type: 'Trail Hazard',
    location: 'Redwood Regional Park (French Trail, Marker 4.2)',
    trailName: 'French Trail',
    mileMarker: '4.2',
    priority: 'High',
    status: 'Open',
    gps: '37.8222, -122.1887',
    date: '2026-11-04',
    weather: '58°F Clear',
    elevationFeet: 1150,
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    notes: 'Deep erosion cut across trail tread after heavy runoff. Requires 2-person crew, timber water bars, and gravel backfill.'
  },
  {
    id: 'ebrpd-tree-002',
    title: 'Hazard Tree Blocking Tread',
    type: 'Trail Hazard',
    location: 'Tilden Regional Park (Sunset Trail)',
    trailName: 'Sunset Trail',
    mileMarker: '2.1',
    priority: 'High',
    status: 'In Progress',
    gps: '37.8966, -122.2484',
    date: '2026-11-03',
    weather: '62°F Sunny',
    elevationFeet: 890,
    photo: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    notes: 'Large fallen bay laurel tree across trail tread. Crosscut saw crew scheduled.'
  },
  {
    id: 'ebrpd-culvert-003',
    title: 'Culvert Clogged & Water Backing Up',
    type: 'Trail Hazard',
    location: 'Mt. Diablo State Park (Mitchell Canyon)',
    trailName: 'Mitchell Canyon Trail',
    mileMarker: '1.6',
    priority: 'Medium',
    status: 'Resolved',
    gps: '37.8819, -121.9188',
    date: '2026-11-01',
    weather: '55°F Overcast',
    elevationFeet: 1420,
    photo: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    notes: 'Cleared debris blockage from 18-inch corrugated pipe culvert.'
  }
];

function seedInitialIncidents() {
  const defaultIncidents = sampleLogs.map((incident) => ({ ...incident }));

  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultIncidents));
      localStorage.setItem(SAMPLE_VERSION_KEY, String(SEEDED_SAMPLE_VERSION));
    }
  } catch (error) {
    console.warn('Could not seed local data store:', error);
  }

  return defaultIncidents;
}

function renderIncidentPhotoCell(incident, safePhotoAlt) {
  const photoMeta = deriveLocationMatchedPhoto(incident);
  if (!photoMeta.url) {
    return '<span class="empty-state">None</span>';
  }

  const safePhotoUrl = escapeAttribute(photoMeta.url);
  const safeSource = escapeHtml(photoMeta.sourceLabel);
  const safeFallbackPhoto = escapeAttribute(photoMeta.fallbackUrl || '');
  const onErrorHandler = safeFallbackPhoto
    ? ` onerror="this.onerror=null;this.src='${safeFallbackPhoto}'"`
    : '';

  return `
    <div class="photo-thumb-wrap">
      <img class="photo-thumb" src="${safePhotoUrl}" alt="${safePhotoAlt}"${onErrorHandler} />
      <span class="photo-source">${safeSource}</span>
    </div>
  `;
}

function deriveLocationMatchedPhoto(incident) {
  const sanitizedPhoto = sanitizeImageUrl(incident.photo || incident.photoUrl || '');
  const coordinates = parseGpsCoordinates(incident.gps);
  const isSeededIncident = String(incident.id || '').startsWith('sample-');
  const isDataUpload = sanitizedPhoto.startsWith('data:image/');
  const isGoogleUploadedImage = sanitizedPhoto.includes('googleusercontent.com');

  if ((isDataUpload || isGoogleUploadedImage) && sanitizedPhoto) {
    return {
      url: sanitizedPhoto,
      fallbackUrl: '',
      sourceLabel: 'Uploaded image'
    };
  }

  if (coordinates) {
    if (!isSeededIncident && sanitizedPhoto) {
      return {
        url: sanitizedPhoto,
        fallbackUrl: buildOpenStreetMapPreviewUrl(coordinates.latitude, coordinates.longitude),
        sourceLabel: 'Custom image'
      };
    }

    return {
      url: buildGoogleMapsPreviewUrl(coordinates.latitude, coordinates.longitude),
      fallbackUrl: buildOpenStreetMapPreviewUrl(coordinates.latitude, coordinates.longitude),
      sourceLabel: 'GPS map preview'
    };
  }

  if (sanitizedPhoto) {
    return {
      url: sanitizedPhoto,
      fallbackUrl: '',
      sourceLabel: 'Reference image'
    };
  }

  return {
    url: '',
    fallbackUrl: '',
    sourceLabel: ''
  };
}

function buildGoogleMapsPreviewUrl(latitude, longitude) {
  const lat = Number(latitude).toFixed(6);
  const lng = Number(longitude).toFixed(6);
  const marker = `${lat},${lng}`;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=${MAP_PREVIEW_SIZE}&maptype=terrain&markers=color:red%7C${encodeURIComponent(marker)}`;
}

function buildOpenStreetMapPreviewUrl(latitude, longitude) {
  const lat = Number(latitude).toFixed(6);
  const lng = Number(longitude).toFixed(6);
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=${MAP_PREVIEW_SIZE}&markers=${lat},${lng},red-pushpin`;
}

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
const resetSeededDataButton = document.getElementById('resetSeededDataButton');
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
  renderReportDetailPage();
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

  if (resetSeededDataButton) {
    resetSeededDataButton.addEventListener('click', resetToLatestSeededData);
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
  attachReportDetailEventListeners();
}

function ensureFieldAssistUi() {
  if (!form) return;

  const fieldGrid = form.querySelector('.field-grid');
  if (!fieldGrid) return;

  ensureNotesField(fieldGrid);
  ensureNearbyObservationsField(fieldGrid);
  ensureEnvironmentMetricsUi();
}

function ensureEnvironmentMetricsUi() {
  const metrics = document.getElementById('envMetrics');
  if (metrics) return;

  const fieldGrid = form && form.querySelector('.field-grid');
  if (!fieldGrid) return;

  const metricsContainer = document.createElement('div');
  metricsContainer.id = 'envMetrics';
  metricsContainer.className = 'env-metrics';
  metricsContainer.style.display = 'none';
  metricsContainer.style.margin = '10px 0';
  metricsContainer.style.padding = '10px';
  metricsContainer.style.background = '#e2e8f0';
  metricsContainer.style.borderRadius = '8px';
  metricsContainer.innerHTML = `
    <strong>Field Conditions:</strong>
    <span id="elevationDisplay">Elevation: Loading...</span> |
    <span id="weatherDisplay">Weather: Loading...</span>
  `;

  const photoUrlLabel = photoUrlInput ? photoUrlInput.closest('label') : null;
  if (photoUrlLabel) {
    fieldGrid.insertBefore(metricsContainer, photoUrlLabel);
    return;
  }

  fieldGrid.appendChild(metricsContainer);
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

      if (!navigator.onLine) {
        hideEnvironmentMetrics();
        setNearbyObservationsPlaceholder('Offline mode: nearby observations unavailable.');
        return;
      }

      showEnvironmentMetrics();
      setEnvironmentDisplay('elevationDisplay', 'Elevation: Loading...');
      setEnvironmentDisplay('weatherDisplay', 'Weather: Loading...');
      enrichLocationContext(latitude, longitude);
    },
    (error) => {
      gpsInput.value = 'Location unavailable';
      updateGpsStatusBadge(false);
      hideEnvironmentMetrics();
      console.error('Geolocation error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

function showEnvironmentMetrics() {
  const envMetrics = document.getElementById('envMetrics');
  if (envMetrics) {
    envMetrics.style.display = 'block';
  }
}

function hideEnvironmentMetrics() {
  const envMetrics = document.getElementById('envMetrics');
  if (envMetrics) {
    envMetrics.style.display = 'none';
  }
}

function setEnvironmentDisplay(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function enrichLocationContext(latitude, longitude) {
  if (!navigator.onLine) {
    hideEnvironmentMetrics();
    setNearbyObservationsPlaceholder('Offline mode: nearby observations unavailable.');
    return;
  }

  fetchLocationWeather(latitude, longitude)
    .then((weather) => {
      if (!weather) {
        setEnvironmentDisplay('weatherDisplay', 'Weather: Unavailable');
        return;
      }

      updateWeatherDisplay(weather);
      appendWeatherToNotes(weather);
    })
    .catch(() => {
      setEnvironmentDisplay('weatherDisplay', 'Weather: Unavailable');
    });

  fetchUSGSElevation(latitude, longitude)
    .then((elevationFeet) => {
      if (!Number.isFinite(elevationFeet)) {
        setEnvironmentDisplay('elevationDisplay', 'Elevation: Unavailable');
        return;
      }

      setElevationBadge(elevationFeet);
      appendElevationToNotes(elevationFeet);
    })
    .catch(() => {
      setEnvironmentDisplay('elevationDisplay', 'Elevation: Unavailable');
    });

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

  const temperatureF = ((weather.temperatureC * 9) / 5) + 32;
  const weatherSummary = `Weather: ${Math.round(temperatureF)}°F, ${weather.condition}`;
  const currentNotes = notesInput.value.trim();

  if (currentNotes.includes(weatherSummary)) return;
  notesInput.value = currentNotes ? `${currentNotes}\n${weatherSummary}` : weatherSummary;
}

function appendElevationToNotes(elevationFeet) {
  const notesInput = document.getElementById('incidentNotes');
  if (!notesInput) return;

  const elevationSummary = `Elevation: ${Math.round(elevationFeet).toLocaleString()} ft`;
  const currentNotes = notesInput.value.trim();

  if (currentNotes.includes(elevationSummary)) return;
  notesInput.value = currentNotes ? `${currentNotes}\n${elevationSummary}` : elevationSummary;
}

function updateWeatherDisplay(weather) {
  const temperatureF = ((weather.temperatureC * 9) / 5) + 32;
  setEnvironmentDisplay('weatherDisplay', `Weather: ${Math.round(temperatureF)}°F, ${weather.condition}`);
}

function setElevationBadge(elevationFeet) {
  setEnvironmentDisplay('elevationDisplay', `Elevation: ${Math.round(elevationFeet).toLocaleString()} ft`);
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
  const normalizedSamples = seedInitialIncidents().map(normalizeIncident);

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSamples));
      localStorage.setItem(SAMPLE_VERSION_KEY, String(SEEDED_SAMPLE_VERSION));
      return normalizedSamples;
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSamples));
      localStorage.setItem(SAMPLE_VERSION_KEY, String(SEEDED_SAMPLE_VERSION));
      return normalizedSamples;
    }

    const normalizedSaved = parsed.map(normalizeIncident);
    const mergedIncidents = mergeSeedIncidents(normalizedSaved, normalizedSamples);
    const storedSampleVersion = Number(localStorage.getItem(SAMPLE_VERSION_KEY) || 0);
    const shouldPersistMerged = mergedIncidents.length !== normalizedSaved.length || storedSampleVersion < SEEDED_SAMPLE_VERSION;

    if (shouldPersistMerged) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedIncidents));
      localStorage.setItem(SAMPLE_VERSION_KEY, String(SEEDED_SAMPLE_VERSION));
    }

    return mergedIncidents;
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSamples));
    localStorage.setItem(SAMPLE_VERSION_KEY, String(SEEDED_SAMPLE_VERSION));
    return normalizedSamples;
  }
}

function mergeSeedIncidents(savedIncidents, seededIncidents) {
  const savedIds = new Set(savedIncidents.map((incident) => incident.id));
  const missingSeededIncidents = seededIncidents.filter((incident) => !savedIds.has(incident.id));
  return savedIncidents.concat(missingSeededIncidents);
}

function normalizeIncident(rawIncident = {}) {
  const normalizedPhoto = sanitizeImageUrl(rawIncident.photo || rawIncident.photoUrl || '');
  const normalizedPhotos = normalizeIncidentPhotos(rawIncident.photos, normalizedPhoto);
  const normalizedWeather = normalizeIncidentWeather(rawIncident.weather);
  const normalizedElevationFeet = normalizeIncidentElevation(rawIncident.elevationFeet);

  const normalized = {
    id: String(rawIncident.id || `incident-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
    title: String(rawIncident.title || rawIncident.name || '').trim(),
    type: String(rawIncident.type || 'Trail Hazard'),
    location: String(rawIncident.location || '').trim(),
    trailName: String(rawIncident.trailName || '').trim(),
    mileMarker: String(rawIncident.mileMarker || '').trim(),
    priority: String(rawIncident.priority || 'Medium'),
    status: String(rawIncident.status || 'Flagged'),
    gps: String(rawIncident.gps || '').trim(),
    date: String(rawIncident.date || new Date().toISOString().slice(0, 10)),
    photo: normalizedPhoto,
    photoUrl: normalizedPhoto,
    photos: normalizedPhotos,
    notes: String(rawIncident.notes || '').trim(),
    weather: normalizedWeather,
    elevationFeet: normalizedElevationFeet,
    followUpActions: String(rawIncident.followUpActions || '').trim(),
    createdAt: normalizeIncidentCreatedAt(rawIncident.createdAt, rawIncident.date)
  };

  const validStatuses = ['Flagged', 'Open', 'Pending Trail Match', 'In Progress', 'Reported to District', 'Resolved'];
  if (!validStatuses.includes(normalized.status)) {
    normalized.status = 'Open';
  }

  if (!normalized.location && normalized.trailName) {
    normalized.location = normalized.trailName;
  }

  const displayPhoto = deriveLocationMatchedPhoto(normalized);
  if (displayPhoto.url) {
    normalized.photo = displayPhoto.url;
  }

  return normalized;
}

function normalizeIncidentPhotos(rawPhotos, fallbackPhoto) {
  const list = Array.isArray(rawPhotos) ? rawPhotos : [];
  const sanitizedList = list
    .map((entry) => sanitizeImageUrl(entry))
    .filter(Boolean);

  if (fallbackPhoto && !sanitizedList.includes(fallbackPhoto)) {
    sanitizedList.unshift(fallbackPhoto);
  }

  return sanitizedList;
}

function normalizeIncidentWeather(rawWeather) {
  const weather = String(rawWeather || '').trim();
  if (!weather) return '';
  if (/^loading$/i.test(weather) || /^unavailable$/i.test(weather)) return '';
  return weather;
}

function normalizeIncidentElevation(rawElevation) {
  const value = Number(rawElevation);
  return Number.isFinite(value) ? Math.round(value) : null;
}

function normalizeIncidentCreatedAt(rawCreatedAt, rawDate) {
  const createdAt = String(rawCreatedAt || '').trim();
  if (createdAt) {
    const parsed = new Date(createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const dateOnly = String(rawDate || '').trim();
  if (!dateOnly) return new Date().toISOString();

  const fallbackDate = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(fallbackDate.getTime())) {
    return new Date().toISOString();
  }

  return fallbackDate.toISOString();
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
          const photoMeta = deriveLocationMatchedPhoto(incident);
          const safePhoto = escapeAttribute(photoMeta.url);
          const safeFallbackPhoto = escapeAttribute(photoMeta.fallbackUrl || '');
          const safeAlt = escapeAttribute(`${incident.location || incident.type} photo`);
          const safeLocation = escapeHtml(incident.location || 'Unlabeled location');
          const safeDate = escapeHtml(formatDate(incident.date));
          const safeSource = escapeHtml(photoMeta.sourceLabel);
          const onErrorHandler = safeFallbackPhoto
            ? ` onerror="this.onerror=null;this.src='${safeFallbackPhoto}'"`
            : '';

          return `
            <article class="hero-photo-item">
              <img src="${safePhoto}" alt="${safeAlt}"${onErrorHandler} />
              <div class="hero-photo-meta">
                <strong>${safeLocation}</strong>
                <span>${safeDate} • ${safeSource}</span>
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
    tableBody.innerHTML = '<div class="incident-empty-state">No incidents match the current filters.</div>';
    return;
  }

  tableBody.innerHTML = filtered
    .map((incident) => renderIncidentCard(incident))
    .join('');
}

function renderIncidentCard(incident) {
  const coordinates = parseGpsCoordinates(incident.gps);
  const photoMeta = deriveLocationMatchedPhoto(incident);
  const photoSource = photoMeta.url || '';
  const priorityClass = toPriorityClass(incident.priority);
  const statusClass = toStatusClass(incident.status);
  const safeId = escapeAttribute(incident.id);
  const safeTitle = escapeHtml(incident.title || incident.location || incident.trailName || 'Field report');
  const safePriority = escapeHtml(incident.priority || 'Medium');
  const safeStatus = escapeHtml(incident.status || 'Open');
  const safeNotes = escapeHtml(incident.notes || 'No notes recorded for this report.');
  const safeTrailName = escapeHtml(incident.trailName || '—');
  const safeParkName = escapeHtml(incident.location || '—');
  const safeCoordinates = coordinates ? `${Number(coordinates.latitude).toFixed(4)}, ${Number(coordinates.longitude).toFixed(4)}` : 'Unavailable';
  const elevationFeet = getIncidentElevationFeet(incident);
  const formattedGps = coordinates && Number.isFinite(elevationFeet) ? `GPS: ${safeCoordinates} (Elevation: ${Math.round(elevationFeet).toLocaleString()} ft)` : `GPS: ${safeCoordinates}`;
  const nearestTrailhead = deriveNearestTrailheadName(incident, coordinates);
  const mapActions = renderExternalMapActions(incident, coordinates);
  const isEditing = state.editingIncidentId === incident.id;
  const editPanel = isEditing ? renderInlineEditForm(incident) : '';
  const actionLabel = incident.status === 'Resolved' ? 'Reopen' : 'Resolve';

  return `
    <article class="incident-card" data-id="${safeId}">
      <div class="incident-card-header">
        <div class="incident-header-copy">
          <h3>${safeTitle}</h3>
        </div>
        <div class="incident-badges">
          <span class="badge ${priorityClass}">${safePriority}</span>
          <span class="badge ${statusClass}">${safeStatus}</span>
        </div>
      </div>

      ${photoSource ? `
        <button type="button" class="incident-photo-button" data-action="preview-photo" data-id="${safeId}" data-photo="${escapeAttribute(photoSource)}" aria-label="Open photo for ${safeTitle}">
          <img src="${escapeAttribute(photoSource)}" alt="${escapeHtml(`${incident.location || incident.type} field photo`) }" class="incident-card-photo" loading="lazy" />
        </button>
      ` : '<div class="incident-photo-placeholder">No photo attached</div>'}

      <div class="incident-card-body">
        <div class="incident-detail-group">
          <span class="detail-field-label">Park</span>
          <p>${safeParkName}</p>
        </div>

        <div class="incident-detail-group">
          <span class="detail-field-label">Nearest trailhead</span>
          <p>${escapeHtml(nearestTrailhead || 'Unavailable')}</p>
        </div>

        <div class="incident-detail-group">
          <span class="detail-field-label">Trail</span>
          <p>${safeTrailName}</p>
        </div>

        <div class="incident-detail-group gps-detail-group">
          <span class="detail-field-label">GPS</span>
          <p>${escapeHtml(formattedGps)}</p>
        </div>

        <div class="incident-detail-group">
          <span class="detail-field-label">Notes</span>
          <p class="incident-notes">${safeNotes}</p>
        </div>

        ${mapActions}

        <div class="incident-card-actions">
          <a href="report-detail.html?id=${encodeURIComponent(incident.id)}" class="primary-button card-primary-button">🔍 View Detailed Report</a>
          <button class="table-button" type="button" data-action="edit-match" data-id="${safeId}">Update Location / Match Trail</button>
          <button class="table-button toggle-btn" type="button" data-action="toggle" data-id="${safeId}">${actionLabel}</button>
          <button class="table-button remove-btn" type="button" data-action="remove" data-id="${safeId}">Remove</button>
        </div>

        ${editPanel}
      </div>
    </article>
  `;
}

function renderTableCell(label, content) {
  return `<td data-label="${escapeAttribute(label)}">${content}</td>`;
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
      <span class="external-map-label">🗺️ Open in External Maps</span>
      <div class="map-btn-group external-map-actions map-btn-grid">
        <button class="table-button" data-action="open-alltrails" data-id="${safeId}">AllTrails</button>
        <button class="table-button" data-action="open-google" data-id="${safeId}"${disabledAttr}${unavailableTitle}>Google Maps</button>
        <button class="table-button" data-action="open-apple" data-id="${safeId}"${disabledAttr}${unavailableTitle}>Apple Maps</button>
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
  const statuses = ['Open', 'Pending Trail Match', 'In Progress', 'Resolved'];
  const normalizedCurrent = String(currentStatus || 'Open').trim();
  const selectedValue = ['Flagged', 'Reported to District'].includes(normalizedCurrent) ? 'Open' : normalizedCurrent;

  return statuses
    .map((status) => `<option value="${escapeAttribute(status)}"${selectedValue === status ? ' selected' : ''}>${escapeHtml(status)}</option>`)
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

  if (action === 'preview-photo') {
    const photoSource = target.dataset.photo || '';
    if (photoSource) {
      openDetailImageModal(photoSource);
    }
    return;
  }

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

function attachReportDetailEventListeners() {
  if (page !== 'report-detail' && page !== 'history') return;

  const actionLogForm = document.getElementById('actionLogForm');
  const gallery = document.getElementById('detailPhotoContainer');
  const modal = document.getElementById('imageModal') || document.getElementById('detailImageModal');
  const modalCloseButton = document.getElementById('closeModalBtn') || document.getElementById('detailImageModalClose');

  if (actionLogForm) {
    actionLogForm.addEventListener('submit', handleReportFollowUpSave);
  }

  if (gallery) {
    gallery.addEventListener('click', handleGalleryImageOpen);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeDetailImageModal();
      }
    });
  }

  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeDetailImageModal);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDetailImageModal();
    }
  });
}

function renderReportDetailPage() {
  if (page !== 'report-detail') return;

  const reportState = document.getElementById('reportStateMessage');
  const reportContent = document.getElementById('reportDetailContent');
  const reportId = getReportIncidentIdFromUrl();
  const incidents = loadReportIncidentsFromStorage();

  if (!reportId) {
    setReportDetailState('No report id was provided.', true);
    return;
  }

  const incident = incidents.find((entry) => entry.id === reportId);
  if (!incident) {
    setReportDetailState('Report not found. Return to history and choose another report.', true);
    return;
  }

  setReportDetailState('', false);
  if (reportContent) {
    reportContent.hidden = false;
  }

  const coordinates = parseGpsCoordinates(incident.gps);
  const nearestTrailhead = deriveNearestTrailheadName(incident, coordinates);
  const weatherSummary = getIncidentWeatherSummary(incident);
  const elevationFeet = getIncidentElevationFeet(incident);
  const incidentPhotos = getIncidentPhotoGallery(incident);

  const incidentTitle = document.getElementById('detailIncidentTitle');
  const incidentIdLabel = document.getElementById('detailIncidentId');
  const dateTimeLabel = document.getElementById('detailLoggedDateTime');
  const priorityBadge = document.getElementById('detailPriorityBadge');
  const currentStatusBadge = document.getElementById('detailCurrentStatusBadge');
  const actionLogStatusSelect = document.getElementById('actionLogStatusSelect');
  const parkUnitLabel = document.getElementById('detailParkUnit');
  const categoryLabel = document.getElementById('detailIncidentCategory');
  const trailheadLabel = document.getElementById('detailTrailhead');
  const coordinatesLabel = document.getElementById('detailCoordinates');
  const elevationLabel = document.getElementById('detailElevation');
  const weatherLabel = document.getElementById('detailWeather');
  const notesArea = document.getElementById('detailNotes');
  const followUpArea = document.getElementById('followUpActionsInput');
  const followUpStatus = document.getElementById('followUpSaveStatus');

  if (incidentTitle) {
    const typeLabel = incident.title || incident.type || 'Incident';
    incidentTitle.textContent = `${typeLabel} Report`;
  }

  if (incidentIdLabel) {
    incidentIdLabel.textContent = `Report ID: ${incident.id}`;
  }

  if (dateTimeLabel) {
    dateTimeLabel.textContent = formatDateTime(incident.createdAt, incident.date);
  }

  if (priorityBadge) {
    priorityBadge.className = `badge ${toPriorityClass(incident.priority)}`;
    priorityBadge.textContent = incident.priority || 'Medium';
  }

  if (currentStatusBadge) {
    const statusText = toDetailStatusValue(incident.status);
    currentStatusBadge.className = `badge ${toStatusClass(incident.status)}`;
    currentStatusBadge.textContent = statusText;
  }

  if (actionLogStatusSelect) {
    actionLogStatusSelect.value = toDetailStatusValue(incident.status);
    actionLogStatusSelect.dataset.incidentId = incident.id;
  }

  if (parkUnitLabel) {
    const parkText = incident.location || incident.trailName || 'Unavailable';
    parkUnitLabel.innerHTML = `<span class="badge park">🌲 ${escapeHtml(parkText)}</span>`;
  }

  if (categoryLabel) {
    categoryLabel.textContent = incident.type || 'Uncategorized';
  }

  if (trailheadLabel) {
    trailheadLabel.textContent = nearestTrailhead || 'Unavailable';
  }

  if (coordinatesLabel) {
    const coordText = coordinates ? `${Number(coordinates.latitude).toFixed(4)}, ${Number(coordinates.longitude).toFixed(4)}` : 'Unavailable';
    coordinatesLabel.innerHTML = `<span class="badge location">📍 ${escapeHtml(coordText)}</span>`;
  }

  if (elevationLabel) {
    const elevationFeetValue = getIncidentElevationFeet(incident);
    if (Number.isFinite(elevationFeetValue)) {
      elevationLabel.innerHTML = `<span class="badge elevation">⛰️ ${Math.round(elevationFeetValue).toLocaleString()} ft</span>`;
    } else {
      elevationLabel.textContent = 'Pending Online Sync';
    }
  }

  if (weatherLabel) {
    const weatherSummaryValue = getIncidentWeatherSummary(incident);
    if (weatherSummaryValue) {
      weatherLabel.innerHTML = `<span class="badge weather">🌤️ ${weatherSummaryValue}</span>`;
    } else {
      weatherLabel.textContent = 'Pending Online Sync';
    }
  }

  if (notesArea) {
    notesArea.textContent = incident.notes || 'No notes recorded for this report.';
  }

  if (followUpArea) {
    followUpArea.value = incident.followUpActions || '';
    followUpArea.dataset.incidentId = incident.id;
  }

  if (followUpStatus) {
    followUpStatus.textContent = '';
  }

  renderReportPhotoGallery(incidentPhotos, incident);
  renderReportMapLinks(incident, coordinates);

  function setReportDetailState(message, showState) {
    if (reportState) {
      reportState.textContent = message;
      reportState.hidden = !showState;
    }

    if (reportContent) {
      reportContent.hidden = showState;
    }
  }
}

function getReportIncidentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  return id ? String(id).trim() : '';
}

function loadReportIncidentsFromStorage() {
  const storageKeys = [STORAGE_KEY, 'incidents'];

  for (const key of storageKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeIncident);
      }
    } catch (error) {
      continue;
    }
  }

  return [];
}

function deriveNearestTrailheadName(incident, coordinates) {
  if (coordinates) {
    const nearest = findNearestTrailhead(coordinates.latitude, coordinates.longitude);
    if (nearest) return nearest;
  }

  return incident.location || incident.trailName || '';
}

function getIncidentWeatherSummary(incident) {
  const fromField = String(incident.weather || '').trim();
  if (fromField) return fromField;

  const notes = String(incident.notes || '');
  const match = notes.match(/Weather:\s*([^\n]+)/i);
  return match ? match[1].trim() : '';
}

function getIncidentElevationFeet(incident) {
  const directValue = Number(incident.elevationFeet);
  if (Number.isFinite(directValue)) {
    return directValue;
  }

  const notes = String(incident.notes || '');
  const match = notes.match(/Elevation:\s*([0-9,]+)\s*ft/i);
  if (!match) return null;

  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

function getIncidentPhotoGallery(incident) {
  const fallbackPhoto = sanitizeImageUrl(incident.photo || incident.photoUrl || '');
  const normalizedPhotos = normalizeIncidentPhotos(incident.photos, fallbackPhoto);
  return normalizedPhotos.filter((entry) => entry.startsWith('data:image/') || entry.startsWith('blob:') || /^https?:\/\//.test(entry));
}

function renderReportPhotoGallery(photos, incident) {
  const gallery = document.getElementById('detailPhotoContainer');
  if (!gallery) return;

  if (!photos.length) {
    gallery.innerHTML = '<p class="empty-state">No field photo attached</p>';
    return;
  }

  const photoAlt = escapeAttribute(`${incident.location || incident.type || 'Trail report'} field photo`);
  gallery.innerHTML = photos
    .map((photo, index) => `
      <button type="button" class="detail-photo-button" data-photo-src="${escapeAttribute(photo)}" aria-label="Open photo ${index + 1}">
        <img src="${escapeAttribute(photo)}" alt="${photoAlt}" class="detail-photo-image report-detail-photo report-photo-preview" loading="lazy" />
      </button>
    `)
    .join('');
}

function renderReportMapLinks(incident, coordinates) {
  const allTrailsLink = document.getElementById('detailMapAllTrails');
  const googleMapsLink = document.getElementById('detailMapGoogle');
  const appleMapsLink = document.getElementById('detailMapApple');
  const gaiaMapsLink = document.getElementById('detailMapGaia');

  if (allTrailsLink) {
    const href = getAllTrailsDeepLink(incident, coordinates);
    allTrailsLink.href = href;
    allTrailsLink.setAttribute('target', '_blank');
    allTrailsLink.setAttribute('rel', 'noopener');
  }

  if (googleMapsLink) {
    const href = coordinates ? getGoogleMapsDeepLink(coordinates.latitude, coordinates.longitude) : '';
    setMapLinkState(googleMapsLink, href);
  }

  if (appleMapsLink) {
    const href = coordinates ? getGeoDeepLink(coordinates.latitude, coordinates.longitude) : '';
    if (href) {
      appleMapsLink.href = href;
      appleMapsLink.setAttribute('target', '_blank');
      appleMapsLink.setAttribute('rel', 'noopener');
      appleMapsLink.removeAttribute('aria-disabled');
      appleMapsLink.classList.remove('disabled-link');
    } else {
      appleMapsLink.removeAttribute('href');
      appleMapsLink.setAttribute('aria-disabled', 'true');
      appleMapsLink.classList.add('disabled-link');
    }
    return;
  }

  if (gaiaMapsLink) {
    const href = coordinates ? getGaiaGpsDeepLink(coordinates.latitude, coordinates.longitude) : '';
    setMapLinkState(gaiaMapsLink, href);
  }
}

function setMapLinkState(element, href) {
  if (!element) return;

  if (!href) {
    element.removeAttribute('href');
    element.setAttribute('aria-disabled', 'true');
    element.classList.add('disabled-link');
    return;
  }

  element.href = href;
  element.setAttribute('target', '_blank');
  element.setAttribute('rel', 'noopener');
  element.removeAttribute('aria-disabled');
  element.classList.remove('disabled-link');
}

function toDetailStatusValue(status) {
  const normalized = String(status || '').trim();
  if (normalized === 'Resolved') return 'Resolved';
  if (normalized === 'In Progress') return 'In Progress';
  if (normalized === 'Pending Trail Match') return 'Pending Trail Match';
  if (normalized === 'Open') return 'Open';
  if (normalized === 'Reported to District') return 'Open';
  if (normalized === 'Flagged') return 'Open';
  return 'Open';
}

function fromDetailStatusValue(status) {
  const normalized = String(status || '').trim();
  if (normalized === 'Resolved' || normalized === 'Pending Trail Match' || normalized === 'In Progress' || normalized === 'Open') {
    return normalized;
  }
  return 'Open';
}

function handleReportFollowUpSave(event) {
  event.preventDefault();

  const followUpInput = document.getElementById('followUpActionsInput');
  const statusSelect = document.getElementById('actionLogStatusSelect');
  const statusMessage = document.getElementById('followUpSaveStatus');
  if (!followUpInput) return;

  const incidentId = (statusSelect && statusSelect.dataset.incidentId) || followUpInput.dataset.incidentId;
  if (!incidentId) return;

  const incident = state.incidents.find((entry) => entry.id === incidentId);
  if (!incident) return;

  const newEntry = String(followUpInput.value || '').trim();
  if (newEntry) {
    const stamp = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date());
    const line = `[${stamp}] ${newEntry}`;
    incident.followUpActions = incident.followUpActions ? `${incident.followUpActions}\n${line}` : line;
  }

  if (statusSelect) {
    incident.status = fromDetailStatusValue(statusSelect.value);
  }

  persistIncidents();

  followUpInput.value = '';
  renderReportDetailPage();

  if (statusMessage) {
    statusMessage.textContent = 'Follow-up actions saved.';
  }
}

function handleGalleryImageOpen(event) {
  const trigger = event.target.closest('[data-photo-src]');
  if (!trigger) return;

  const source = trigger.dataset.photoSrc || '';
  if (!source) return;

  const modal = document.getElementById('imageModal') || document.getElementById('detailImageModal');
  const modalImage = document.getElementById('detailImageModalImg');
  if (!modal || !modalImage) return;

  modalImage.src = source;
  modal.classList.add('active');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function openDetailImageModal(source) {
  const modal = document.getElementById('imageModal') || document.getElementById('detailImageModal');
  const modalImage = document.getElementById('detailImageModalImg');
  if (!modal || !modalImage || !source) return;

  modalImage.src = source;
  modal.classList.add('active');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDetailImageModal() {
  const modal = document.getElementById('imageModal') || document.getElementById('detailImageModal');
  const modalImage = document.getElementById('detailImageModalImg');
  if (!modal || !modalImage) return;

  modal.classList.remove('active');
  modal.hidden = true;
  modalImage.src = '';
  document.body.style.overflow = '';
}

function formatDateTime(createdAt, fallbackDate) {
  const created = String(createdAt || '').trim();
  const parsedCreated = created ? new Date(created) : null;

  if (parsedCreated && !Number.isNaN(parsedCreated.getTime())) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(parsedCreated);
  }

  return formatDate(fallbackDate);
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
  incident.photos = normalizeIncidentPhotos(incident.photos, updatedPhoto);

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

  const selectedPhotoValue = getSelectedPhotoValue();

  const incident = normalizeIncident({
    id: `incident-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type: String(formData.get('type') || 'Trail Hazard'),
    location,
    priority: String(formData.get('priority') || 'Medium'),
    status: pendingTrailMatch ? 'Pending Trail Match' : String(formData.get('status') || 'Flagged'),
    gps,
    date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
    createdAt: new Date().toISOString(),
    photo: selectedPhotoValue,
    photos: selectedPhotoValue ? [selectedPhotoValue] : [],
    notes: String(formData.get('notes') || '').trim(),
    weather: getCurrentWeatherSnapshot(),
    elevationFeet: getCurrentElevationSnapshot()
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

function getCurrentWeatherSnapshot() {
  const weatherDisplay = document.getElementById('weatherDisplay');
  if (!weatherDisplay) return '';

  const fullText = String(weatherDisplay.textContent || '').trim();
  if (!fullText || /loading|unavailable/i.test(fullText)) {
    return '';
  }

  return fullText.replace(/^Weather:\s*/i, '').trim();
}

function getCurrentElevationSnapshot() {
  const elevationDisplay = document.getElementById('elevationDisplay');
  if (!elevationDisplay) return null;

  const fullText = String(elevationDisplay.textContent || '').trim();
  if (!fullText || /loading|unavailable/i.test(fullText)) {
    return null;
  }

  const match = fullText.match(/Elevation:\s*([0-9,]+)/i);
  if (!match) return null;

  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? Math.round(value) : null;
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
  setEnvironmentDisplay('elevationDisplay', 'Elevation: Loading...');
}

function resetToLatestSeededData() {
  const shouldReset = window.confirm('Replace current saved incidents with the latest seeded dataset? This cannot be undone.');
  if (!shouldReset) return;

  state.incidents = sampleLogs.map(normalizeIncident);
  state.editingIncidentId = null;
  localStorage.setItem(SAMPLE_VERSION_KEY, String(SEEDED_SAMPLE_VERSION));
  persistIncidents();

  if (statusFilter) statusFilter.value = 'all';
  if (typeFilter) typeFilter.value = 'all';

  renderDashboard();
  renderTable();
  renderResumeOutput();

  window.alert(`Loaded ${state.incidents.length} seeded incident entries.`);
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
  if (status === 'In Progress') return 'in-progress';
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
