# Firebase Authentication & Cloud Firestore Integration
## East Bay Trail Tracker - Cloud Sync Architecture

---

## 🚀 Overview

This document describes the Firebase Authentication and Firestore integration for the East Bay Trail Tracker PWA. The implementation follows a **hybrid offline-first** architecture where:

1. **All reports are saved locally** to localStorage immediately (offline-first)
2. **Automatic cloud sync** uploads reports to Firestore when online and authenticated
3. **Auto-sync on network recovery** resumes when connectivity returns
4. **Auth guard** allows viewing reports offline but prompts to sign in for cloud sync

---

## 📋 Architecture & Data Flow

### Offline-First Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│ User Creates Incident Report                                     │
├─────────────────────────────────────────────────────────────────┤
│ 1. SAVE TO localStorage (immediate, always works)               │
│    ✅ Reports available offline                                  │
│    ✅ Instant feedback to user                                   │
│                          ↓                                        │
│ 2. CHECK ONLINE & LOGGED IN                                     │
│    ├─ Online + Logged In → Upload to Firestore                  │
│    │  ✅ Real-time cloud sync                                    │
│    │  ✅ Marked as "syncedToCloud: true"                         │
│    │                                                             │
│    └─ Offline OR Not Logged In → Queue for Later               │
│       ✅ Auto-queue with incident ID                            │
│       ✅ Resume sync when online                                 │
│                          ↓                                        │
│ 3. NETWORK STATE LISTENER                                       │
│    ├─ 'online' event → Sync queued incidents                   │
│    ├─ 'offline' event → Pause sync, queue locally               │
│    └─ Status indicator → Real-time feedback                     │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Ranger First Visit                                               │
├─────────────────────────────────────────────────────────────────┤
│ 1. App loads → Auth state listener triggers                     │
│ 2. No user logged in → "Sign In" button in header               │
│ 3. Click "Sign In" → Auth modal opens                           │
│ 4. Toggle to "Register" → New ranger form                       │
│    ├─ Email                                                      │
│    ├─ Password (6+ chars)                                        │
│    ├─ Ranger Name (e.g., "Katlyn Rodriguez")                    │
│    └─ Badge ID (e.g., "EBRPD-842")                              │
│ 5. Submit → Firebase Auth creates user                          │
│ 6. Firestore saves ranger profile to 'rangers' collection       │
│ 7. Auth state changes → Header updates with profile badge       │
│ 8. Auto-sync starts → Any queued incidents upload               │
└─────────────────────────────────────────────────────────────────┘

Returning Ranger:
1. App loads → Auth state listener triggers
2. User already logged in (session persisted)
3. Header shows profile badge: "[KR] Katlyn Rodriguez | EBRPD-842"
4. New incidents automatically sync to cloud
5. Can click logout button (✕) to sign out
```

---

## 🔧 Firebase Setup (Configuration Required)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: `east-bay-trail-tracker`
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Set Up Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Save

### Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in Production mode**
4. Select region (e.g., `us-west1`)
5. Create

### Step 4: Set Firestore Security Rules

Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rangers collection - allow read/write for authenticated users
    match /rangers/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Field incidents collection - allow write for authenticated users
    match /field_incidents/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.uploadedBy || 
                      request.auth.uid == resource.data.ownerId);
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.uploadedBy;
    }
  }
}
```

### Step 5: Add Firebase SDK to HTML

Already included in all HTML files:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js"></script>
```

### Step 6: Update Firebase Config

Edit [firebase-config.js](/firebase-config.js) with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_ID',
  appId: 'YOUR_APP_ID'
};
```

Get these from Firebase Console:
1. Go to **Project Settings** (⚙️ icon)
2. Click **Your apps** section
3. Click **Web** app
4. Copy entire config object
5. Paste into `firebase-config.js`

---

## 📁 Firestore Data Structure

### Rangers Collection

```javascript
/rangers/{uid}
{
  uid: "firebase-auth-uid",
  email: "ranger@ebrpd.org",
  rangerName: "Katlyn Rodriguez",
  badgeId: "EBRPD-842",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  status: "active"
}
```

### Field Incidents Collection

```javascript
/field_incidents/{incidentId}
{
  id: "incident-1730865600000-abc123",
  title: "Severe Gully Erosion & Washout",
  type: "Trail Hazard",
  location: "Redwood Regional Park (French Trail, Marker 4.2)",
  priority: "High",
  status: "Open",
  gps: "37.8222, -122.1887",
  date: "2026-11-04",
  weather: "58°F Clear",
  elevationFeet: 1150,
  photo: "https://images.unsplash.com/...",
  photos: [...],
  notes: "Deep erosion cut across trail...",
  
  // Cloud-specific fields
  uploadedBy: "firebase-auth-uid",
  rangerName: "Katlyn Rodriguez",
  badgeId: "EBRPD-842",
  uploadedAt: Timestamp,
  localId: "incident-1730865600000-abc123",
  syncedToCloud: true
}
```

---

## 🛠️ API Reference

### Firebase Configuration Module (`firebase-config.js`)

#### Initialization Functions

**`initializeFirebase()`**
- Initializes Firebase Auth and Firestore
- Called automatically on DOM ready
- Enables offline persistence

**`initAuthStateListener()`**
- Listens for auth state changes
- Updates UI when user logs in/out
- Loads user profile on login
- Auto-syncs queued incidents

**`initNetworkStateListener()`**
- Listens for 'online' and 'offline' events
- Updates status indicator
- Triggers sync when network returns

#### Authentication Functions

**`registerRanger(email, password, rangerName, badgeId)`**
```javascript
// Create new ranger account
await registerRanger(
  'ranger@ebrpd.org',
  'SecurePassword123',
  'Katlyn Rodriguez',
  'EBRPD-842'
);
// Returns: true on success, false on error
```

**`loginRanger(email, password)`**
```javascript
// Sign in existing ranger
await loginRanger('ranger@ebrpd.org', 'SecurePassword123');
// Returns: true on success, false on error
```

**`logoutRanger()`**
```javascript
// Sign out current ranger
await logoutRanger();
```

#### Cloud Sync Functions

**`saveIncidentHybrid(incident)`**
```javascript
// Save incident with offline-first hybrid sync
// 1. Always saves to localStorage
// 2. If online + logged in, uploads to Firestore
// 3. If offline or not logged in, queues for later sync

const incident = {
  id: 'incident-1730865600000-abc123',
  title: 'Trail Erosion',
  location: 'French Trail',
  // ... other fields
};

await saveIncidentHybrid(incident);
```

**`syncOfflineIncidents()`**
```javascript
// Manually sync all queued incidents to Firestore
// Called automatically on:
// - User login
// - Network 'online' event
// - Can be called manually if needed

await syncOfflineIncidents();
```

#### UI Functions

**`showLoginModal()`**
```javascript
// Open auth modal for login/register
showLoginModal();
```

**`hideLoginModal()`**
```javascript
// Close auth modal
hideLoginModal();
```

**`toggleAuthForm()`**
```javascript
// Switch between login and register forms
toggleAuthForm();
```

**`updateAuthUI(isLoggedIn)`**
```javascript
// Update header auth button/profile
// Called automatically, but can be called manually
updateAuthUI(true);  // Show profile badge
updateAuthUI(false); // Show "Sign In" button
```

---

## 🔐 Security Features

### Offline Data Protection
- ✅ All data stored in browser localStorage (local encryption not implemented)
- ✅ No sensitive data transmitted over unencrypted connections
- ✅ Passwords never stored locally

### Cloud Data Protection
- ✅ Firebase Security Rules enforce:
  - Only authenticated users can upload
  - Users can only read their own incidents (with future enhancements)
  - Firestore enforces document ownership

### Authentication Security
- ✅ Firebase Auth handles password hashing
- ✅ Email verification can be enabled in Firebase console
- ✅ Badge ID format validation (EBRPD-####)
- ✅ Session tokens automatically managed

---

## 📊 User State Management

### Global State Variables (in `firebase-config.js`)

```javascript
let currentUser = null;        // Firebase Auth user object
let userProfile = null;        // Ranger profile from Firestore
let db = null;                 // Firestore database reference
let auth = null;               // Firebase Auth reference
```

### Local Storage Keys

```javascript
STORAGE_KEY                    // Main incidents storage
SYNC_QUEUE_KEY                 // Queue of incidents waiting to sync
SYNC_ATTEMPTS_KEY              // (Reserved for retry logic)
```

---

## 🔄 Sync Queue Management

### How Sync Queue Works

1. **Incident Saved Locally** → Always saves to localStorage
2. **Check Online & Auth** → If both true, upload immediately
3. **If Not Ready** → Add incident ID to sync queue
4. **Queue Stored** → `localStorage['trail-tracker-sync-queue']` = `[id1, id2, ...]`
5. **Network Returns** → 'online' event triggers `syncOfflineIncidents()`
6. **Sync All Queued** → Uploads each queued incident
7. **Mark As Synced** → Updates `syncedToCloud: true` in local incident
8. **Remove From Queue** → Cleans up `SYNC_QUEUE_KEY`

### Example Sync Scenario

```
Time 0:00 - User offline
  → Logs incident #1 → Saved locally + queued
  → Logs incident #2 → Saved locally + queued
  Queue: [incident-1, incident-2]

Time 0:05 - User comes online
  → 'online' event fires
  → syncOfflineIncidents() called
  → incident-1 uploads to Firestore ✅
  → incident-2 uploads to Firestore ✅
  → Queue cleared
  → User notified: "Synced 2 reports to EBRPD cloud"

Time 0:10 - New incident
  → User logged in + online
  → incident-3 created
  → Saved locally + uploaded to Firestore immediately ✅
  → No queue needed
```

---

## 💻 Integration with app.js

### Modified Functions

**`persistIncidents()`**
- Enhanced to call `syncLatestIncidentToCloud()`
- Still saves to localStorage first
- Attempts cloud upload if conditions met
- Catches and logs errors without breaking offline flow

**`getStoredIncidents()`**
- NEW helper function
- Returns parsed incidents from localStorage
- Safely handles parse errors

**`syncLatestIncidentToCloud()`**
- NEW function
- Called after each incident save
- Uploads most recent incident if not already synced

### Integration Points

```javascript
// When user submits incident form (handleFormSubmit)
handleFormSubmit(event) {
  // ... create incident ...
  state.incidents.unshift(incident);
  persistIncidents();           // ← Triggers cloud sync!
  renderDashboard();
  renderTable();
}
```

---

## 🎨 UI Components

### Auth Modal (`#authModal`)

**States:**
- `hidden` = closed
- visible = login form or register form

**Elements:**
- Email input (`#loginEmail`)
- Password input (`#loginPassword`)
- Ranger name input (`#registerName`) - hidden in login mode
- Badge ID input (`#registerBadgeId`) - hidden in login mode
- Form toggle button - switches between login/register
- Submit button - "Sign In" or "Register"

### User Auth Pill (`#userAuthPill`)

**When Logged Out:**
```html
<button class="login-btn" onclick="showLoginModal()">Sign In</button>
```

**When Logged In:**
```html
<span class="user-initials">KR</span>
<span class="user-badge">
  <span class="user-name">Katlyn Rodriguez</span>
  <span class="user-badge-id">EBRPD-842</span>
</span>
<button class="logout-btn" onclick="handleLogout()">✕</button>
```

### Status Indicator (`#offlineStatus`)

**Online:**
```html
<span class="status-dot"></span>
<span>Online</span>
```

**Offline:**
```html
<span class="status-dot offline"></span>
<span>Offline</span>
```

---

## 🧪 Testing Guide

### Test 1: Registration & Login

1. Open app in browser
2. Click "Sign In" in header
3. Click "New ranger? Register"
4. Fill in:
   - Email: `test@ebrpd.org`
   - Password: `TestPassword123`
   - Name: `Test Ranger`
   - Badge ID: `EBRPD-999`
5. Click "Register"
6. Verify:
   - ✅ Modal closes
   - ✅ Header shows "[TR] Test Ranger | EBRPD-999"
   - ✅ Firebase Auth user created
   - ✅ Firestore ranger profile created

### Test 2: Offline Sync Queue

1. Sign out
2. Disable internet (DevTools → Network → Offline)
3. Log an incident
4. Verify:
   - ✅ Incident saved to localStorage
   - ✅ Header shows "Offline"
5. Re-enable internet
6. Verify:
   - ✅ Header shows "Online"
   - ✅ Incident synced to Firestore
   - ✅ Notification: "Synced 1 report to EBRPD cloud"

### Test 3: Auto-Sync on Network Recovery

1. Sign in
2. Disable network
3. Log multiple incidents (offline)
4. Verify:
   - ✅ All saved locally
   - ✅ Header shows "Offline"
5. Enable network
6. Verify:
   - ✅ All incidents upload automatically
   - ✅ Status changes to "Online"
   - ✅ No manual action needed

### Test 4: Logout & Viewing Offline

1. Sign in and log incident
2. Sign out (click ✕ button)
3. Disable network
4. Verify:
   - ✅ Can still view reports
   - ✅ Can still create new incidents
   - ✅ New incidents saved locally
   - ✅ Cannot sync without login

---

## 🚨 Troubleshooting

### "Firebase not initialized" Error

**Problem:** Firebase SDK failed to load
**Solution:** 
1. Check Firebase CDN URLs in HTML are correct
2. Verify network requests in DevTools
3. Check browser console for CORS errors
4. Ensure firebase-config.js loads after SDK

### "Permission denied" on Firestore Upload

**Problem:** Security rules rejected write
**Solution:**
1. Verify user is authenticated (`currentUser` not null)
2. Check Firestore Security Rules allow:
   - `request.auth != null` for create
   - `request.auth.uid == uploadedBy` for read/write
3. Review user's UID matches in rules

### Incidents Not Syncing

**Problem:** Offline incidents won't sync after coming online
**Solution:**
1. Verify network status with `navigator.onLine`
2. Check sync queue: `localStorage.getItem('trail-tracker-sync-queue')`
3. Verify user logged in: `currentUser != null`
4. Check browser console for errors
5. Manually trigger: `syncOfflineIncidents()`

### Profile Badge Not Showing

**Problem:** User logged in but badge not visible
**Solution:**
1. Verify `currentUser` is set
2. Check `userProfile` loaded from Firestore
3. Verify `updateAuthUI(true)` called
4. Clear browser cache and reload

---

## 🔮 Future Enhancements

### Phase 2: Read & Query

- [ ] Query incidents by ranger
- [ ] Query incidents by status/priority
- [ ] Share incidents between rangers (permissions)
- [ ] Firestore real-time listeners for team updates

### Phase 3: Analytics & Reporting

- [ ] Cloud Functions for incident aggregation
- [ ] District-level dashboard (Firestore aggregation)
- [ ] Export reports to CSV/PDF
- [ ] Automated alerts for high-priority incidents

### Phase 4: Advanced Sync

- [ ] Conflict resolution (if same incident edited offline & online)
- [ ] Version history & rollback
- [ ] Batch sync with progress indicator
- [ ] Sync retry with exponential backoff

### Phase 5: Team Collaboration

- [ ] Real-time collaboration on incident notes
- [ ] Presence indicators (who's viewing this incident)
- [ ] Comment threads on incidents
- [ ] Activity log with change tracking

---

## 📞 Support & Contact

For issues with:
- **Firebase Setup:** [Firebase Documentation](https://firebase.google.com/docs/web/setup)
- **Authentication:** [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- **Firestore:** [Firestore Docs](https://firebase.google.com/docs/firestore)
- **This App:** See project README.md

---

**Status:** ✅ Integration Complete (Config Required)

**Last Updated:** November 2026

**Maintained by:** Copilot
