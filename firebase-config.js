// Firebase Configuration & Auth State Management
// East Bay Trail Tracker - Cloud Sync & Authentication Layer

// ============================================================================
// FIREBASE INITIALIZATION (Replace with your actual Firebase config)
// ============================================================================

const firebaseConfig = {
  apiKey: 'AIzaSyDemoKey_ReplaceWithYourActualKey',
  authDomain: 'east-bay-trail-tracker.firebaseapp.com',
  projectId: 'east-bay-trail-tracker',
  storageBucket: 'east-bay-trail-tracker.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

// Initialize Firebase (loaded from CDN in HTML)
let db = null;
let auth = null;

function initializeFirebase() {
  try {
    // Initialize Firebase Auth
    auth = firebase.auth();
    
    // Initialize Firestore
    db = firebase.firestore();
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence disabled');
      } else if (err.code === 'unimplemented') {
        console.warn('Persistence not supported in this browser');
      }
    });
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

// ============================================================================
// USER STATE & AUTHENTICATION
// ============================================================================

let currentUser = null;
let userProfile = null;

/**
 * Initialize auth state listener
 * Runs on page load to check if user is logged in
 */
function initAuthStateListener() {
  if (!auth) return;
  
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      loadUserProfile(user.uid);
      updateAuthUI(true);
      syncOfflineIncidents();
    } else {
      currentUser = null;
      userProfile = null;
      updateAuthUI(false);
    }
  });
}

/**
 * Load user profile from Firestore
 */
async function loadUserProfile(uid) {
  if (!db) return;
  
  try {
    const docRef = db.collection('rangers').doc(uid);
    const docSnap = await docRef.get();
    
    if (docSnap.exists()) {
      userProfile = docSnap.data();
      updateUserBadgeInHeader();
    } else {
      console.log('No user profile found, will be created on first save');
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

/**
 * Register new ranger account
 */
async function registerRanger(email, password, rangerName, badgeId) {
  if (!auth || !db) {
    alert('Firebase not initialized. Please try again.');
    return false;
  }
  
  try {
    // Create auth user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    
    // Create ranger profile in Firestore
    const rangerProfile = {
      uid,
      email,
      rangerName,
      badgeId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };
    
    await db.collection('rangers').doc(uid).set(rangerProfile);
    userProfile = rangerProfile;
    
    console.log('✅ Ranger registered successfully:', rangerName);
    hideLoginModal();
    updateAuthUI(true);
    
    return true;
  } catch (error) {
    console.error('❌ Registration error:', error);
    alert(`Registration failed: ${error.message}`);
    return false;
  }
}

/**
 * Login ranger account
 */
async function loginRanger(email, password) {
  if (!auth) {
    alert('Firebase not initialized. Please try again.');
    return false;
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ Ranger logged in successfully');
    hideLoginModal();
    updateAuthUI(true);
    syncOfflineIncidents();
    
    return true;
  } catch (error) {
    console.error('❌ Login error:', error);
    alert(`Login failed: ${error.message}`);
    return false;
  }
}

/**
 * Logout ranger account
 */
async function logoutRanger() {
  if (!auth) return;
  
  try {
    await auth.signOut();
    currentUser = null;
    userProfile = null;
    updateAuthUI(false);
    console.log('✅ Ranger logged out');
    return true;
  } catch (error) {
    console.error('❌ Logout error:', error);
    return false;
  }
}

// ============================================================================
// HYBRID OFFLINE-FIRST CLOUD SYNC
// ============================================================================

const SYNC_QUEUE_KEY = 'trail-tracker-sync-queue';
const SYNC_ATTEMPTS_KEY = 'trail-tracker-sync-attempts';

/**
 * Save incident with hybrid offline-first strategy
 * 1. Save to localStorage immediately (offline cache)
 * 2. If online and logged in, upload to Firestore
 * 3. Listen for online event to sync queued items
 */
async function saveIncidentHybrid(incident) {
  try {
    // Step 1: Always save to localStorage (offline-first)
    const incidents = getStoredIncidents() || [];
    
    // Generate ID if not exists
    if (!incident.id) {
      incident.id = `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add sync metadata
    incident.syncedToCloud = false;
    incident.localSavedAt = new Date().toISOString();
    
    // Replace existing or add new
    const existingIndex = incidents.findIndex(i => i.id === incident.id);
    if (existingIndex >= 0) {
      incidents[existingIndex] = incident;
    } else {
      incidents.push(incident);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    console.log('✅ Incident saved to localStorage:', incident.id);
    
    // Step 2: If online and logged in, upload to Firestore
    if (navigator.onLine && currentUser && db) {
      await uploadIncidentToFirestore(incident);
    } else {
      // Queue for sync when online
      queueIncidentForSync(incident.id);
      
      if (!navigator.onLine) {
        console.log('📱 Offline - incident queued for cloud sync when signal returns');
      } else if (!currentUser) {
        console.log('🔐 Not logged in - incident queued for cloud sync');
      }
    }
    
    return incident;
  } catch (error) {
    console.error('Error in saveIncidentHybrid:', error);
    throw error;
  }
}

/**
 * Upload incident to Firestore
 */
async function uploadIncidentToFirestore(incident) {
  if (!db || !currentUser) {
    return false;
  }
  
  try {
    const firestoreDoc = {
      ...incident,
      uploadedBy: currentUser.uid,
      rangerName: userProfile?.rangerName || 'Unknown',
      badgeId: userProfile?.badgeId || 'N/A',
      uploadedAt: new Date(),
      localId: incident.id,
      syncedToCloud: true
    };
    
    // Use incident ID as doc ID for consistency
    await db.collection('field_incidents').doc(incident.id).set(firestoreDoc, { merge: true });
    
    // Update local record to mark as synced
    const incidents = getStoredIncidents() || [];
    const index = incidents.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      incidents[index].syncedToCloud = true;
      incidents[index].cloudSyncedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    }
    
    console.log('☁️ Incident uploaded to Firestore:', incident.id);
    return true;
  } catch (error) {
    console.error('Error uploading to Firestore:', error);
    queueIncidentForSync(incident.id);
    return false;
  }
}

/**
 * Queue incident for later sync
 */
function queueIncidentForSync(incidentId) {
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)) || [];
    
    if (!queue.includes(incidentId)) {
      queue.push(incidentId);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log('📋 Incident queued for sync:', incidentId);
    }
  } catch (error) {
    console.error('Error queueing incident:', error);
  }
}

/**
 * Sync all queued offline incidents to Firestore
 */
async function syncOfflineIncidents() {
  if (!navigator.onLine || !currentUser || !db) {
    return;
  }
  
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)) || [];
    if (queue.length === 0) {
      return;
    }
    
    const incidents = getStoredIncidents() || [];
    let syncedCount = 0;
    
    for (const incidentId of queue) {
      const incident = incidents.find(i => i.id === incidentId);
      if (incident) {
        const success = await uploadIncidentToFirestore(incident);
        if (success) {
          syncedCount++;
        }
      }
    }
    
    // Remove synced items from queue
    const remainingQueue = queue.filter(id => {
      const incident = incidents.find(i => i.id === id);
      return incident && !incident.syncedToCloud;
    });
    
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    if (syncedCount > 0) {
      console.log(`✅ Synced ${syncedCount} incident(s) to cloud`);
      showNotification(`Synced ${syncedCount} report(s) to EBRPD cloud`);
    }
  } catch (error) {
    console.error('Error syncing offline incidents:', error);
  }
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Update auth UI based on login state
 */
function updateAuthUI(isLoggedIn) {
  const headerPill = document.getElementById('userAuthPill');
  
  if (!headerPill) return;
  
  if (isLoggedIn && currentUser && userProfile) {
    // Show user profile
    const initials = userProfile.rangerName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    headerPill.innerHTML = `
      <span class="user-initials">${initials}</span>
      <span class="user-badge">
        <span class="user-name">${escapeHtml(userProfile.rangerName)}</span>
        <span class="user-badge-id">${escapeHtml(userProfile.badgeId)}</span>
      </span>
      <button class="logout-btn" onclick="handleLogout()" title="Log out">✕</button>
    `;
    
    headerPill.classList.add('logged-in');
  } else {
    // Show login prompt
    headerPill.innerHTML = `
      <button class="login-btn" onclick="showLoginModal()">Sign In</button>
    `;
    
    headerPill.classList.remove('logged-in');
  }
}

/**
 * Update user badge in header with profile info
 */
function updateUserBadgeInHeader() {
  updateAuthUI(true);
}

/**
 * Show login/register modal
 */
function showLoginModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Hide login/register modal
 */
function hideLoginModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value?.trim();
  const password = document.getElementById('loginPassword')?.value?.trim();
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  const loginBtn = event.target.querySelector('button[type="submit"]');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  
  const success = await loginRanger(email, password);
  
  loginBtn.disabled = false;
  loginBtn.textContent = 'Sign In';
  
  if (success) {
    document.getElementById('authForm').reset();
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('registerEmail')?.value?.trim();
  const password = document.getElementById('registerPassword')?.value?.trim();
  const rangerName = document.getElementById('registerName')?.value?.trim();
  const badgeId = document.getElementById('registerBadgeId')?.value?.trim();
  
  if (!email || !password || !rangerName || !badgeId) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  if (!badgeId.startsWith('EBRPD-')) {
    alert('Badge ID must start with EBRPD- (e.g., EBRPD-842)');
    return;
  }
  
  const registerBtn = event.target.querySelector('button[type="submit"]');
  registerBtn.disabled = true;
  registerBtn.textContent = 'Creating Account...';
  
  const success = await registerRanger(email, password, rangerName, badgeId);
  
  registerBtn.disabled = false;
  registerBtn.textContent = 'Register';
  
  if (success) {
    document.getElementById('authForm').reset();
  }
}

/**
 * Handle logout button
 */
async function handleLogout() {
  if (confirm('Log out? You can still view offline reports, but new entries won\'t sync to EBRPD cloud.')) {
    await logoutRanger();
  }
}

/**
 * Toggle between login and register forms
 */
function toggleAuthForm() {
  const form = document.getElementById('authForm');
  const toggle = document.getElementById('authFormToggle');
  
  if (!form) return;
  
  const isLogin = form.dataset.mode === 'login';
  form.dataset.mode = isLogin ? 'register' : 'login';
  
  if (toggle) {
    toggle.textContent = isLogin ? 'Already have an account? Sign In' : 'New ranger? Register';
  }
  
  // Update form fields
  updateAuthForm();
}

/**
 * Update auth form based on mode
 */
function updateAuthForm() {
  const form = document.getElementById('authForm');
  const mode = form?.dataset.mode || 'login';
  const nameField = document.getElementById('registerNameField');
  const badgeField = document.getElementById('registerBadgeIdField');
  const submitBtn = form?.querySelector('button[type="submit"]');
  
  if (mode === 'register') {
    if (nameField) nameField.style.display = 'block';
    if (badgeField) badgeField.style.display = 'block';
    if (submitBtn) submitBtn.textContent = 'Register';
  } else {
    if (nameField) nameField.style.display = 'none';
    if (badgeField) badgeField.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Sign In';
  }
}

// ============================================================================
// NETWORK STATE & AUTO-SYNC
// ============================================================================

/**
 * Listen for online/offline events
 */
function initNetworkStateListener() {
  window.addEventListener('online', () => {
    console.log('📡 Back online - syncing queued incidents');
    document.getElementById('offlineStatus').innerHTML = `
      <span class="status-dot"></span>
      <span>Online</span>
    `;
    syncOfflineIncidents();
  });
  
  window.addEventListener('offline', () => {
    console.log('📡 Offline mode - incidents saved locally');
    document.getElementById('offlineStatus').innerHTML = `
      <span class="status-dot offline"></span>
      <span>Offline</span>
    `;
  });
}

/**
 * Show temporary notification
 */
function showNotification(message) {
  console.log(message);
  // Could integrate with a toast notification library here
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
  initAuthStateListener();
  initNetworkStateListener();
  updateAuthUI(false); // Set initial state
});
