# 🗺️ Tangible Community - Real-Time ArUco Marker Detection System

A real-time ArUco marker detection system that bridges physical and digital worlds. Place markers on a physical map, and watch them appear instantly on your digital display. Perfect for community planning, urban design, and interactive mapping applications.

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Start Backend (Terminal 1)
```bash
cd backend
python manage.py runserver
```
✅ Should show: `Starting development server at http://127.0.0.1:8000/`

### 2️⃣ Start ArUco Detection (Terminal 2)
```bash
cd opencv
python main_with_backend.py
```
✅ Should show camera feed window and "Sent X marker positions to backend"

### 3️⃣ Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```
✅ Should show: `Local: http://localhost:3000`

### 🎯 View the Live Map
Open your browser to: **http://localhost:3000/main**

**What You Should See:**
- ✅ Green "Live (X markers)" badge
- ✅ Colored boxes representing physical markers
- ✅ Markers update position every 5 seconds
- ✅ Smooth animations when markers move

---

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Installation](#-installation)
- [System Architecture](#-system-architecture)
- [Configuration](#-configuration)
- [Frontend Development](#-frontend-development)
- [Physical Setup](#-physical-setup)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Customization](#-customization)
- [Technical Details](#-technical-details)
- [Future Enhancements](#-future-enhancements)

---

## 🎯 System Overview

### Components
The system consists of three main components that work together:

1. **OpenCV Detection System** - Real-time ArUco marker detection via camera
2. **Django Backend API** - Data management and storage layer
3. **Next.js Frontend** - Interactive web interface for visualization

### Data Flow
```
Physical Map with Markers
    ↓ (Camera)
OpenCV Detection (Python)
    ↓ (HTTP POST every 5s)
Django Backend API
    ↓ (HTTP GET every 5s)
React Frontend
    ↓
User's Browser Display
```

### Key Features
- ✅ Real-time marker position tracking
- ✅ Automatic coordinate conversion (cm → pixels)
- ✅ Smooth animations and transitions
- ✅ Asset type-based styling (colors, sizes)
- ✅ Rotation detection and display
- ✅ Error handling and recovery
- ✅ Responsive design for all screen sizes

---

## 💻 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Webcam or external camera
- ArUco markers (printable)

### Option 1: Local Development Setup

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

#### OpenCV Setup
```bash
# Navigate to opencv directory
cd opencv

# Install OpenCV dependencies (or use existing venv)
pip install opencv-python numpy requests
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Docker Deployment

#### Backend with Docker
```bash
# Navigate to backend
cd backend

# Copy environment file
cp env.example .env

# Edit .env with your settings
# Then run setup script
chmod +x setup.sh
./setup.sh
```

#### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Access Django shell
docker-compose exec web python manage.py shell

# Run migrations
docker-compose exec web python manage.py migrate
```

---

## 🏗️ System Architecture

### Component Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR COMPLETE SYSTEM                          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   OPENCV    │   │   BACKEND   │   │  FRONTEND   │
    │  Detection  │──▶│   Django    │◀──│   React     │
    │   System    │   │     API     │   │   Next.js   │
    └─────────────┘   └─────────────┘   └─────────────┘
```

### File Structure
```
tangible-community/
│
├── opencv/                          [PHYSICAL → DIGITAL BRIDGE]
│   ├── main_with_backend.py        ✅ Main detection script
│   ├── detect_aruco_marker.py      ✅ ArUco detection logic
│   ├── homography.py               ✅ Coordinate transformation
│   ├── test_backend_connection.py  🧪 Backend connectivity test
│   ├── test_basic_aruco.py         🧪 ArUco detection test
│   └── marker_positions.json       📝 Local backup file
│
├── backend/                         [DATA MANAGEMENT LAYER]
│   ├── ideas/
│   │   ├── models.py               💾 Asset database model
│   │   ├── views.py                🔌 API endpoints
│   │   ├── serializers.py          📦 Data serialization
│   │   └── urls.py                 🛣️  API routing
│   ├── core/
│   │   └── settings.py             ⚙️  Django configuration
│   ├── requirements.txt            📋 Python dependencies
│   ├── docker-compose.yml          🐳 Docker configuration
│   └── db.sqlite3                  💾 Database storage
│
└── frontend/                        [USER INTERFACE LAYER]
    ├── src/
    │   ├── hooks/
    │   │   └── useMarkerPositions.ts    🔄 Real-time data fetching
    │   ├── utils/
    │   │   └── coordinateConverter.ts   🎯 Coordinate conversion
    │   ├── components/
    │   │   ├── mapping.tsx              🗺️  Main map display
    │   │   └── understand.tsx           📊 Analytics component
    │   └── app/
    │       ├── main/page.tsx            📄 Main page
    │       └── asset-config/page.tsx    ⚙️  Asset configuration
    │
    ├── package.json                 📦 Node dependencies
    └── next.config.ts               ⚙️  Next.js configuration
```

### Data Transformations

#### Stage 1: Camera → OpenCV (Pixels → CM)
```
Camera Coordinates  →  Map Coordinates
Pixels             →  Centimeters (0-35 × 0-23)
Distorted          →  Undistorted (homography)
```

#### Stage 2: OpenCV → Backend (CM → Database)
```
Map Coordinates    →  Backend Database
X: 0-35 cm        →  Asset.x_pos (float)
Y: 0-23 cm        →  Asset.y_pos (float)
Rotation: degrees →  Asset.rotation (float)
Marker ID         →  Asset.marker_id (integer)
```

#### Stage 3: Backend → Frontend (CM → Pixels)
```
Backend (cm)       →  Frontend (pixels)
X: 0-35 cm        →  X: 0-600 pixels (base)
Y: 0-23 cm        →  Y: 0-394 pixels (base)
Asset type        →  Color + Size mapping
```

#### Stage 4: Frontend → Screen (Responsive Display)
```
Base Coordinates   →  Screen Display
600×394 base      →  Scaled to container
Fixed size        →  Maintains aspect ratio
```

### Timing Diagram
```
Time:  0s     5s    10s    15s    20s    25s
       │      │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼      ▼
OpenCV: ●─────●─────●─────●─────●─────●  (Send to backend)
       │      │      │      │      │      │
Backend: ●────●────●────●────●────●  (Update database)
         │     │     │     │     │     │
Frontend: ●───●───●───●───●───●  (Fetch & display)

● = Update event (every 5 seconds)
Maximum latency: ~5 seconds
```

---

## ⚙️ Configuration

### Physical Map Dimensions

**IMPORTANT:** When changing physical map size, update these files:

1. **`frontend/src/utils/coordinateConverter.ts`** (Lines 9-10)
```typescript
const BACKEND_MAP_WIDTH = 35;   // Your map width in cm
const BACKEND_MAP_HEIGHT = 23;  // Your map height in cm
```

2. **`opencv/main_with_backend.py`** (Lines 34-41)
```python
marker_map = {
    0: [0, 0],          # top-left
    1: [35, 0],         # top-right (change width)
    2: [35, 23],        # bottom-right (change both)
    3: [0, 23]          # bottom-left (change height)
}
MAP_WIDTH = 35   # Your map width in cm
MAP_LENGTH = 23  # Your map height in cm
```

3. **`opencv/test_basic_aruco.py`** (Lines 81-84)
```python
marker_map = {
    0: [0, 0],
    1: [35, 0],      # Update these
    2: [35, 23],     # to match
    3: [0, 23]       # your map
}
```

### Backend Configuration

#### Django Settings (`backend/core/settings.py`)
- CORS configuration for frontend access
- Database settings (SQLite by default)
- API endpoints

#### Environment Variables (Docker)
Copy `backend/env.example` to `backend/.env`:
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_ENGINE=django.db.backends.postgresql
DB_NAME=tangible_db
DB_USER=tangible_user
DB_PASSWORD=tangible_password
DB_HOST=db
DB_PORT=5432
```

### OpenCV Configuration

#### Backend URL (`opencv/main_with_backend.py`)
```python
BACKEND_URL = "http://localhost:8000/api/update-marker-positions/"
```

#### Update Frequency
```python
UPDATE_INTERVAL = 5.0  # Send updates every 5 seconds
```

#### Camera Selection
```python
cap = cv2.VideoCapture(0)  # Change to 1, 2, etc. for different cameras
```

### Frontend Configuration

#### API Endpoint (`frontend/src/hooks/useMarkerPositions.ts`)
```typescript
const response = await fetch('http://localhost:8000/api/get-marker-positions/');
```

#### Update Frequency
```typescript
const interval = setInterval(fetchMarkerPositions, 5000); // 5000ms = 5 seconds
```

#### Base Coordinates
These are now automatically calculated from physical map dimensions in `coordinateConverter.ts`:
```typescript
export const FRONTEND_BASE_WIDTH = 600;
export const FRONTEND_BASE_HEIGHT = Math.round(FRONTEND_BASE_WIDTH / (BACKEND_MAP_WIDTH / BACKEND_MAP_HEIGHT));
```

---

## 🎨 Frontend Development

### Next.js Project

This is a Next.js 15.4 project using React 18 and TypeScript.

#### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

#### Key Technologies
- **Next.js 15.4** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **CSS Modules** - Scoped styling

#### Project Structure
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions

#### Editing Pages
- Edit `app/page.tsx` for the home page
- Edit `app/main/page.tsx` for the main mapping interface
- Pages auto-update as you edit

#### Adding New Asset Types

1. **Update Color Mapping** (`src/utils/coordinateConverter.ts`)
```typescript
const colorMap: { [key: string]: string } = {
  'playground': '#FFD700',
  'your_asset_type': '#YOUR_COLOR',  // Add here
};
```

2. **Update Size Mapping** (`src/utils/coordinateConverter.ts`)
```typescript
const sizeMap: { [key: string]: { width: number; height: number } } = {
  'playground': { width: 80, height: 40 },
  'your_asset_type': { width: 70, height: 70 },  // Add here
};
```

3. **Create Asset in Django Admin**
   - Go to http://localhost:8000/admin
   - Add new "Asset background" with matching type name
   - Add "Asset" with marker ID

---

## 🎯 Physical Setup

### Map Configuration

1. **Measure Your Map**
   - Measure width and height in centimeters
   - Note these dimensions for configuration

2. **Print Corner Markers**
   - Print ArUco markers with IDs: 0, 1, 2, 3
   - Use 6×6 ArUco dictionary (DICT_6X6_250)
   - Recommended size: 3-5cm each

3. **Place Corner Markers**
   - **Marker 0**: Top-left corner
   - **Marker 1**: Top-right corner
   - **Marker 2**: Bottom-right corner
   - **Marker 3**: Bottom-left corner
   - Ensure all markers are flat and visible to camera

4. **Camera Setup**
   - Mount camera above map with clear view
   - Ensure all four corners are visible
   - Good lighting is essential
   - Minimize glare and shadows

### Asset Markers

1. **Print Asset Markers**
   - Use IDs 4, 5, 6, etc. for assets
   - Same ArUco dictionary (6×6)
   - Can be smaller than corner markers

2. **Configure in Backend**
   - Log into Django admin (http://localhost:8000/admin)
   - Create "Asset background" entries (types)
   - Create "Asset" entries with matching marker IDs
   - Set asset names and types

3. **Place on Map**
   - Place markers on physical map
   - Watch them appear on digital display
   - Move markers to update positions

---

## 🔌 API Documentation

### Endpoints

#### Update Marker Positions
```http
POST /api/update-marker-positions/
```

**Called by:** OpenCV detection script  
**Frequency:** Every 5 seconds  
**Content-Type:** application/json

**Request Body:**
```json
[
  {
    "id": 4,
    "x": 12.5,
    "y": 8.3,
    "rotation": 45.2
  },
  {
    "id": 5,
    "x": 20.1,
    "y": 15.7,
    "rotation": -12.8
  }
]
```

**Response:**
```json
{
  "status": "success",
  "message": "Marker positions updated",
  "updated_count": 2
}
```

#### Get Marker Positions
```http
GET /api/get-marker-positions/
```

**Called by:** Frontend hook  
**Frequency:** Every 5 seconds  
**Content-Type:** application/json

**Response:**
```json
[
  {
    "id": 4,
    "x": 12.5,
    "y": 8.3,
    "rotation": 45.2,
    "asset_name": "Playground 1",
    "asset_type": "playground"
  },
  {
    "id": 5,
    "x": 20.1,
    "y": 15.7,
    "rotation": -12.8,
    "asset_name": "Dog Park",
    "asset_type": "dogpark"
  }
]
```

### Manual API Testing

```bash
# Get current marker positions
curl http://localhost:8000/api/get-marker-positions/

# Update marker positions
curl -X POST http://localhost:8000/api/update-marker-positions/ \
  -H "Content-Type: application/json" \
  -d '[{"id": 4, "x": 13.37, "y": 5.07, "rotation": 90.0}]'
```

---

## 📖 Usage Guide

### Complete Workflow

#### 1. Initial Setup
```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate  # If using venv
python manage.py runserver

# Terminal 2: Start ArUco detection
cd opencv
python main_with_backend.py

# Terminal 3: Start frontend
cd frontend
npm run dev
```

#### 2. Configure Assets
1. Open http://localhost:8000/admin
2. Login with superuser credentials
3. Navigate to "Asset backgrounds"
4. Add asset types (playground, dogpark, etc.)
5. Navigate to "Assets"
6. Add assets with marker IDs

#### 3. Monitor System
- **Console Output**: OpenCV terminal shows "Sent X markers"
- **Admin Interface**: Real-time position updates in database
- **Frontend Display**: Visual representation at http://localhost:3000/main
- **JSON Backup**: `opencv/marker_positions.json`

#### 4. Place Markers
1. Place corner markers on physical map
2. Wait for detection (should be immediate)
3. Place asset markers
4. Watch positions update on screen

#### 5. Stop System
Press `Ctrl+C` in each terminal window

### Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green "Live (X markers)" | System working, X markers detected |
| 🔴 Red error alert | Backend connection failed |
| ⚪ "No markers detected" | No markers in camera view (normal) |
| 🔄 Loading spinner | Fetching initial data |

### Asset Styling

#### Auto-assigned Colors
| Asset Type | Color | Hex Code |
|-----------|-------|----------|
| Playground | Gold | #FFD700 |
| Dog Park | Green | #22C55E |
| Restroom | Light Blue | #ADD8E6 |
| Baseball Field | Red | #EF4444 |
| Unknown | Gray | #9CA3AF |

#### Auto-assigned Sizes
| Asset Type | Width | Height |
|-----------|-------|--------|
| Playground | 80px | 40px |
| Dog Park | 100px | 100px |
| Restroom | 55px | 30px |
| Baseball Field | 90px | 90px |
| Unknown | 60px | 60px |

*All sizes scale responsively with screen size*

---

## 🧪 Testing

### Test Backend Connection
```bash
cd opencv
python test_backend_connection.py
```
Expected output: Success message confirming backend is reachable

### Test ArUco Detection
```bash
cd opencv
python test_basic_aruco.py
```
Expected output: Camera window showing detected markers

### Frontend Testing
1. Open http://localhost:3000/main
2. Check browser console (F12) for errors
3. Verify "Live" indicator appears
4. Test with physical markers

### System Health Checklist

**Before Starting:**
- [ ] Camera connected and working
- [ ] Physical map prepared with corner markers
- [ ] Assets configured in Django admin
- [ ] All dependencies installed

**During Operation:**
- [ ] Backend console shows no errors
- [ ] OpenCV prints "Sent X markers" every 5 seconds
- [ ] Frontend shows green "Live" indicator
- [ ] Browser console has no errors
- [ ] Markers appear in correct positions

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**Django Import Error**
```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

**Port Already in Use**
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>
```

**Database Migration Errors**
```bash
python manage.py makemigrations
python manage.py migrate
```

#### OpenCV Issues

**OpenCV Import Error**
```bash
pip install opencv-python numpy requests
```

**Camera Not Working**
- Check camera permissions in system settings
- Ensure no other application is using the camera
- Try different camera index: `cv2.VideoCapture(1)`
- Test with Photo Booth (macOS) or Camera app (Windows)

**No Markers Detected**
- Ensure ArUco markers are visible and not obscured
- Check marker orientation (should be upright)
- Verify marker IDs match configuration (0-3 for corners)
- Improve lighting conditions
- Check camera focus

**Backend Connection Failed**
```bash
# Verify backend is running
curl http://localhost:8000/api/get-marker-positions/

# Check firewall settings
# Verify URL in main_with_backend.py matches backend address
```

#### Frontend Issues

**Red Error: "Failed to fetch marker positions"**
- Ensure backend is running on port 8000
- Check CORS settings in Django
- Verify API endpoint URL in `useMarkerPositions.ts`

**No Markers Showing**
1. Check ArUco terminal for "Sent X markers" messages
2. Verify markers are configured in Django admin
3. Check browser console (F12) for errors
4. Verify coordinate conversion settings

**Markers in Wrong Position**
- Verify physical map dimensions match configuration
- Check if corner markers are properly placed
- Ensure camera has clear view of entire map

**Slow Updates**
- Normal behavior: updates every 5 seconds by design
- To change: modify interval in both OpenCV script and frontend hook

#### Docker Issues

**Container Won't Start**
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Check Logs**
```bash
docker-compose logs -f
docker-compose logs -f web  # Just backend logs
```

**Database Connection Issues**
```bash
# Ensure database container is running
docker-compose ps

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Debug Mode

**Enable Verbose Logging:**

OpenCV (`main_with_backend.py`):
```python
# Add print statements
print(f"Detected markers: {detected_markers}")
print(f"Sending to backend: {json.dumps(data, indent=2)}")
```

Django (`settings.py`):
```python
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

Frontend (Browser Console):
```javascript
// Check console for:
// - API requests
// - Response data
// - React errors
```

---

## 🎨 Customization

### Change Update Frequency

**OpenCV** (`main_with_backend.py`):
```python
UPDATE_INTERVAL = 3.0  # Change from 5.0 to 3.0 seconds
```

**Frontend** (`src/hooks/useMarkerPositions.ts`):
```typescript
const interval = setInterval(fetchMarkerPositions, 3000); // Change from 5000 to 3000ms
```

### Change Animation Speed

**Frontend** (`src/components/mapping.tsx`):
```typescript
transition: "all 0.3s ease-in-out", // Change from 0.5s to 0.3s
```

### Add Custom Asset Types

1. **Add Color** (`src/utils/coordinateConverter.ts`):
```typescript
const colorMap: { [key: string]: string } = {
  'school': '#8B5CF6',  // Purple for schools
  'hospital': '#F87171', // Light red for hospitals
  // ... add more
};
```

2. **Add Size** (`src/utils/coordinateConverter.ts`):
```typescript
const sizeMap = {
  'school': { width: 120, height: 80 },
  'hospital': { width: 100, height: 60 },
  // ... add more
};
```

3. **Create in Django Admin**
   - Add "Asset background" with matching type name
   - Add "Asset" instances

### Change Map Background

Replace `frontend/public/map.png` with your own map image, then update dimensions:

**Frontend** (`src/components/mapping.tsx`):
```typescript
const IMG_W = 2800;  // Your image width in pixels
const IMG_H = 1054;  // Your image height in pixels
```

### Customize Marker Display

**Change Shape** (`src/components/mapping.tsx`):
```typescript
borderRadius: "50%", // Circular markers
// or
borderRadius: "8px", // Rounded rectangles
```

**Change Border** (`src/components/mapping.tsx`):
```typescript
border: "3px solid black",  // Thicker border
borderStyle: "dashed",      // Dashed border
```

**Add Shadow** (`src/components/mapping.tsx`):
```typescript
boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
```

---

## 🔧 Technical Details

### Technology Stack

```
Layer              Technology        Version    Purpose
═════              ══════════        ═══════    ═══════
Detection          OpenCV            4.12       ArUco marker detection
                   NumPy             2.2        Matrix operations
                   Python            3.13       Core language

Backend            Django            5.2        Web framework
                   Django REST       3.14       API framework
                   SQLite/Postgres   -          Database
                   Python            3.13       Core language

Frontend           Next.js           15.4       React framework
                   React             18         UI library
                   TypeScript        5.x        Type safety
                   Material-UI       6.x        UI components
                   Node.js           16+        Runtime

Communication      HTTP/REST         -          API protocol
                   JSON              -          Data format
```

### Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **Update Latency** | ~5 seconds | Time from movement to display |
| **Network Requests** | 1 per 5s | Minimal bandwidth usage |
| **Data Size** | ~200 bytes/marker | Very light payload |
| **CPU Usage** | Low | Efficient polling |
| **Memory Usage** | <10MB | Lightweight |
| **Animation FPS** | 60 FPS | Smooth transitions |

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (responsive)
- ⚠️ Internet Explorer not supported

### Coordinate Systems

**Three coordinate systems work together:**

1. **Physical Map**: Real-world centimeters (e.g., 35cm × 23cm)
2. **Base Coordinates**: Normalized pixel space (600px × 394px)
3. **Display Coordinates**: Responsive screen pixels (varies by device)

**Why Base Coordinates?**
- Provides predictable intermediate coordinate space
- Simplifies conversion from physical cm to screen pixels
- Maintains aspect ratio of physical map
- Easier to debug and reason about

---

## 🚀 Future Enhancements

### Short Term
- [ ] Add caching layer to reduce API calls
- [ ] Implement optimistic updates for better UX
- [ ] Add data validation middleware
- [ ] Support for multiple maps
- [ ] Asset image uploads instead of colored boxes

### Medium Term
- [ ] WebSocket integration for true real-time updates
- [ ] Redis for high-performance caching
- [ ] Multi-user synchronization
- [ ] History tracking and playback
- [ ] Export data as CSV/JSON
- [ ] Analytics dashboard

### Long Term
- [ ] Microservices architecture
- [ ] Scalable cloud deployment
- [ ] CDN for static assets
- [ ] Load balancing
- [ ] Mobile app (React Native)
- [ ] AR/VR integration
- [ ] Machine learning for asset recognition

---

## 📚 Learning Resources

### React & Next.js
- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Django
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

### OpenCV & Computer Vision
- [OpenCV Documentation](https://docs.opencv.org/)
- [ArUco Marker Detection Tutorial](https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html)

### API Design
- [RESTful API Best Practices](https://restfulapi.net/)
- [Fetch API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## 📞 Support

### Getting Help

1. **Check Documentation**: Read this README thoroughly
2. **Check Console Logs**: Look for errors in all three terminals
3. **Check Browser Console**: Press F12 to see frontend errors
4. **Test Individual Components**: Use test scripts in opencv folder
5. **Verify Configuration**: Ensure all settings match your setup

### Success Checklist

- [ ] Backend running on port 8000
- [ ] ArUco detection sending data to backend
- [ ] Frontend running on port 3000
- [ ] Camera showing markers clearly
- [ ] All four corner markers detected
- [ ] Browser showing `/main` page
- [ ] Green "Live" indicator visible
- [ ] Markers appearing on screen in correct positions
- [ ] Smooth animations when moving markers

---

## 🎉 Conclusion

**Your tangible community mapping system bridges the physical and digital worlds!**

The system features:
- ✅ Real-time marker detection and tracking
- ✅ Automatic coordinate conversion
- ✅ Smooth animations and professional UI
- ✅ Comprehensive error handling
- ✅ Responsive design for all devices
- ✅ Easy customization and extension

**The physical and digital worlds are now connected!** 🌉

---

## 📄 License

[Add your license here]

---

## 👥 Contributors

[Add contributors here]

---

*Last updated: October 1, 2025*  
*Status: ✅ FULLY OPERATIONAL*
