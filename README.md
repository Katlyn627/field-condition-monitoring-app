# East Bay Trail & Field Condition Tracker (Mobile PWA)

An offline-first, mobile-forward Progressive Web Application (PWA) designed for trail managers, field crews, and outdoor enthusiasts to log, track, and manage trail damage, hazards, and maintenance reports in remote East Bay parks without cellular service.

The app is built to support field operations in areas with limited or no connectivity by keeping incident data on-device, capturing GPS coordinates, storing photos locally, and enabling later review, export, and reporting.

## Overview

The East Bay Trail & Field Condition Tracker helps users document issues such as:

- Trail hazards and erosion
- Invasive species observations
- Trash and infrastructure issues
- Wildlife-impact reports
- Maintenance requests and follow-up statuses

It is optimized for mobile field use with a touch-friendly interface, local persistence, and offline-friendly workflows that continue to work even when the connection drops.

## Core Features & Capabilities

### Offline-First Architecture
- Service worker caching and offline-first behavior for reliable app access in airplane mode or weak signal areas
- Local persistence using `localStorage` for 100% core functionality without a network connection
- Incident logs remain available on-device for logging, editing, and review until connectivity returns

### Dynamic Hardware GPS & Trailhead Sensing
- High-accuracy geolocation capture using the browser's GPS APIs
- Built-in coordinate matching to nearby East Bay trailheads including Tilden, Redwood, Mt. Diablo, Del Valle, and Sunol
- Distance calculations to associate reports with the closest known trail access point
- GPS-ready input, location indicators, and trail context for field entries

### Camera & Photo Gallery Uploads
- Support for photo uploads directly from a device camera or local file gallery
- Lightweight Base64 image handling for storing field photos in the browser
- Offline photo retention for incident cards and historical records

### Multi-Map Deep Linking & Integration
- One-touch navigation links to:
  - AllTrails
  - Google Maps
  - Apple Maps
  - Gaia GPS
- Location-aware map actions for faster follow-up and field validation

### Data Sync & GPX Export
- Export logged incident waypoints into standards-based `.gpx` XML files
- Compatible with outdoor mapping tools, trail planning apps, and field navigation workflows
- Supports importing waypoint data for additional review and continuity across devices

### Adaptive Mobile-First UI/UX
- Touch-friendly 48px interaction targets
- Responsive stacked mobile layouts and desktop-friendly viewing modes
- Compact card-based interface for quick logging in the field
- Clear status indicators for online/offline connectivity and GPS readiness

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript ES6+
- Mobile-first responsive layout patterns using CSS Grid and Flexbox

### Storage & Offline Functionality
- Browser `localStorage` API
- Cache API for service worker-based offline behavior
- Web App Manifest for installability as a PWA
- Browser geolocation APIs

### Tools
- VS Code
- GitHub Pages deployment
- Live Server for local development
- Git and GitHub for version control and collaboration

## Visual Design System

The app features a modern, nature-inspired outdoor ranger aesthetic with high-contrast colors and accessible components:

### Design Principles
- **Forest Green Primary:** #2d5a27 for all primary actions and navigation
- **Amber Trail Accent:** #d97706 for attention-grabbing highlights
- **High-Contrast Badges:** Color-coded status indicators (Red/Amber/Green for priority; Blue/Purple/Orange/Green for resolution)
- **Emoji Iconography:** Quick visual scanning with 📍 (location), 🌲 (park), ⛰️ (elevation), 🌤️ (weather)
- **Accessible Buttons:** 44px minimum touch targets, visible focus outlines for keyboard navigation
- **Card Elevation:** Subtle shadows and hover lift effects for interactive depth

### Color System
| Element | Color | Usage |
|---------|-------|-------|
| Primary Button | #2d5a27 (Forest Green) | Main actions |
| Accent | #d97706 (Amber) | Highlights & CTAs |
| High Priority | #dc2626 (Red) | Immediate hazards |
| Medium Priority | #d97706 (Amber) | Priority repairs |
| Low Priority | #16a34a (Green) | Routine maintenance |
| Resolved Status | #16a34a (Green) | Completed items |

### Accessibility
- ✅ WCAG AAA compliant color contrasts (6.8:1 primary button, 5.2:1+ badges)
- ✅ 44px minimum touch targets on all buttons
- ✅ Visible 2px focus outlines for keyboard navigation
- ✅ No color-only information; all status uses text + color + icons
- ✅ Full keyboard support (Tab, Enter, Escape)

**For complete design documentation, see:** [DESIGN-OVERHAUL.md](./DESIGN-OVERHAUL.md), [DESIGN-BEFORE-AFTER.md](./DESIGN-BEFORE-AFTER.md)

## Project Structure

```text
.
├── app.js                  # Core app logic, state handling, GPS, offline behavior, rendering
├── index.html              # Landing dashboard / home page
├── log.html                # Incident logging form and mobile field inputs
├── history.html            # Incident history, filtering, and record management
├── styles.css              # Mobile-first responsive styling
├── sw.js                   # Service worker for offline caching
├── manifest.json           # PWA install metadata
├── README.md               # Project documentation
├── LICENSE                 # MIT license
```

## Local Development & Installation

Follow these steps to run the app locally.

### Step 1: Clone the repository

```bash
git clone https://github.com/katlyn627/field-condition-monitoring-app.git
cd field-condition-monitoring-app
```

### Step 2: Open the project in VS Code

```text
Open the repository folder in VS Code.
```

### Step 3: Start the app with Live Server

Open the project in VS Code and launch a local preview using the Live Server extension.

Typical local URL:

```text
http://127.0.0.1:5500/index.html
```

### Step 4: Test the PWA installation

On a mobile device or emulator:

- Safari: Use "Add to Home Screen"
- Chrome: Use "Install App"

This allows the app to behave like a native mobile app and remain available for field use.

## Typical Use Cases

- Record trail washouts, fallen limbs, and hazard areas while on patrol
- Capture invasive plant patches and habitat impacts for reporting
- Document trash, infrastructure issues, or maintenance needs in remote park areas
- Record observations in low-signal conditions and review them once back online
- Prepare field data for park stewardship, district reporting, or volunteer coordination

## Offline Behavior

This project is intentionally designed for use in remote or low-connectivity settings. When the device loses service:

- Incident data remains available in the browser
- GPS capture continues to work if the device has location access
- Stored logs remain accessible for review and editing
- The app retains data locally until the user reconnects and sync workflows are available

## Browser Compatibility

The app is intended for modern mobile and desktop browsers that support:

- Service workers
- `localStorage`
- Geolocation APIs
- File uploads and image handling
- Progressive Web App install behavior

## License

This project is licensed under the MIT License.

## Credits

This project is an open-source effort built for East Bay public land stewardship and field management. It is intended to support trail crews, volunteers, and park staff in documenting environmental conditions, maintenance needs, and safety concerns in the field.

## Contributing

Contributions are welcome. If you would like to improve the app, report a bug, or suggest a new field workflow:

- open an issue
- submit a pull request
- share improvements that support mobile field data collection and park maintenance workflows

## Contact

Project repository:

```text
https://github.com/katlyn627/field-condition-monitoring-app
```
