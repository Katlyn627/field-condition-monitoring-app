# Firebase Integration - Quick Reference
## East Bay Trail Tracker PWA

---

## 🚀 Quick Start (5 Steps)

### 1. Get Firebase Credentials
```
Go to Firebase Console → Project Settings → Your Apps → Web
Copy the config object
```

### 2. Update firebase-config.js
```javascript
const firebaseConfig = {
  apiKey: 'YOUR_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'YOUR_ID',
  appId: 'YOUR_APP_ID'
};
```

### 3. Create Firestore Collections
- `rangers/{uid}` - Ranger profiles
- `field_incidents/{id}` - Incident reports

### 4. Deploy Security Rules
Copy from FIREBASE-INTEGRATION-GUIDE.md → Firestore Console → Rules

### 5. Test in Browser
- Open app
- Click "Sign In"
- Register new ranger
- Log an incident
- Verify in Firestore Console

---

## 🔑 Key Functions

### Authentication
```javascript
// Register
await registerRanger(email, password, rangerName, badgeId)

// Login
await loginRanger(email, password)

// Logout
await logoutRanger()
```

### Cloud Sync
```javascript
// Hybrid sync (local + cloud)
await saveIncidentHybrid(incident)

// Manual sync queue
await syncOfflineIncidents()
```

### UI
```javascript
showLoginModal()        // Open auth modal
hideLoginModal()        // Close auth modal
updateAuthUI(isLoggedIn) // Update header badge
```

---

## 📊 Global State

```javascript
currentUser            // Firebase Auth user (null if logged out)
userProfile           // Ranger profile from Firestore
db                    // Firestore database reference
auth                  // Firebase Auth reference
```

---

## 💾 Local Storage Keys

```javascript
'east-bay-condition-tracker'     // All incidents
'trail-tracker-sync-queue'       // Incidents waiting to sync
'trail-tracker-sync-attempts'    // Retry tracking (reserved)
```

---

## 🔄 Hybrid Sync Flow

```
Incident Created
        ↓
Save to localStorage (immediate)
        ↓
Check: online + logged in?
  ├─ YES → Upload to Firestore
  └─ NO → Add to sync queue
        ↓
Network online? User logged in?
  ├─ YES → Auto-sync all queued
  └─ NO → Wait & retry
```

---

## 🧪 Quick Tests

### Test 1: Registration
```
Click "Sign In" → Register → Check Firestore rangers collection
```

### Test 2: Offline Sync
```
Go offline → Log incident → Go online → Check Firestore field_incidents
```

### Test 3: Auto-Sync
```
Log in → Go offline → Log incident → Go online → Auto-syncs
```

---

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| "Firebase not initialized" | Check SDK script tags loaded |
| "Permission denied" | Check Firestore Security Rules |
| Incident not syncing | Check `navigator.onLine` and `currentUser` |
| Modal won't open | Check `getElementById('authModal')` exists |
| User badge not showing | Clear cache, check `userProfile` loaded |

---

## 📱 UI Elements

| Element | ID | Purpose |
|---------|-----|---------|
| Auth modal | `#authModal` | Login/register overlay |
| User badge | `#userAuthPill` | Header profile display |
| Status indicator | `#offlineStatus` | Online/Offline status |
| Login form | `#authForm` | Email/password input |
| Register name | `#registerName` | Ranger name field |
| Badge ID | `#registerBadgeId` | EBRPD-### format |

---

## 🔐 Security Rules Template

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rangers/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /field_incidents/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.uploadedBy;
    }
  }
}
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [FIREBASE-INTEGRATION-GUIDE.md](/FIREBASE-INTEGRATION-GUIDE.md) | Complete setup & deployment (18+ KB) |
| [firebase-config.js](/firebase-config.js) | Auth & sync layer implementation (400+ lines) |
| [FIREBASE-INTEGRATION-SUMMARY.md](/FIREBASE-INTEGRATION-SUMMARY.md) | Overview & testing guide (15+ KB) |

---

## 🎯 Deployment Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Security Rules deployed
- [ ] firebase-config.js updated with credentials
- [ ] Local testing: Registration works
- [ ] Local testing: Offline sync works
- [ ] Local testing: Network recovery works
- [ ] Production Firebase project configured
- [ ] Email verification enabled (optional)
- [ ] Monitoring setup (Firebase Console)
- [ ] Team trained on ranger registration

---

## 📞 Support

### Debugging
1. Open DevTools Console
2. Look for Firebase initialization logs
3. Check Auth state: `console.log(currentUser, userProfile)`
4. Check sync queue: `console.log(localStorage.getItem('trail-tracker-sync-queue'))`

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Check **Authentication** → Users tab
4. Check **Firestore** → Data tab
5. Check **Firestore** → Rules tab

### Logs & Monitoring
- Browser console: `firebase-config.js` logs
- Firebase Console: Real-time database activity
- Firestore Console: Document creation/updates
- Security Rules: Violations in console

---

## 🚀 Next Steps

**Short Term (Week 1):**
- [ ] Configure Firebase project
- [ ] Update firebase-config.js
- [ ] Test locally
- [ ] Deploy to staging

**Medium Term (Week 2-3):**
- [ ] Team training
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitor Firestore usage

**Long Term (Month 2+):**
- [ ] Analyze sync patterns
- [ ] Add real-time team features
- [ ] Implement district dashboard
- [ ] Add export/reporting

---

## 💡 Pro Tips

1. **Offline-First is Your Friend**
   - Always works, even without internet
   - Users expect it in field apps
   - Reduces customer support

2. **Test Network Conditions**
   - DevTools → Network → Offline
   - DevTools → Network → Slow 3G
   - Test with actual field conditions

3. **Monitor Firestore Usage**
   - Watch read/write counts
   - Set up Firebase alerts
   - Plan for scalability

4. **Security Matters**
   - Test Security Rules thoroughly
   - Never expose API keys
   - Use environment variables in production

5. **User Education**
   - Explain offline-first to rangers
   - Show sync status indicator
   - Create quick reference card

---

**Version:** 1.0  
**Last Updated:** November 2026  
**Status:** ✅ Complete & Ready for Deployment
