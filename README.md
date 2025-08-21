# Tangible Community - ArUco Marker Detection System

A real-time ArUco marker detection system that automatically syncs marker positions with a Django backend for asset tracking and management.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Webcam
- ArUco markers (IDs 0, 1, 2, 3 for corners + additional markers for assets)

### Option 1: Local Development Setup

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd tangible-community
```

#### 2. Backend Setup (Django)
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

#### 3. OpenCV Setup
```bash
# Navigate to opencv directory (in a new terminal)
cd opencv

# Install OpenCV dependencies
pip install opencv-python numpy requests
```

#### 4. Run ArUco Detection
```bash
# In the opencv directory
python main_with_backend.py
```

### Option 2: Docker Deployment

#### 1. Backend with Docker
```bash
# Navigate to backend
cd backend

# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

#### 2. OpenCV Setup (same as local)
```bash
# Navigate to opencv directory
cd opencv

# Install OpenCV dependencies
pip install opencv-python numpy requests

# Run ArUco detection
python main_with_backend.py
```

#### 3. Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Access Django shell
docker-compose exec web python manage.py shell
```

## 📋 System Overview

### Components
- **Django Backend**: REST API for storing and retrieving marker positions
- **OpenCV Detection**: Real-time ArUco marker detection and tracking
- **Real-time Sync**: Automatic position updates sent to backend every second

### API Endpoints
- `POST /api/update-marker-positions/` - Receive marker position updates
- `GET /api/get-marker-positions/` - Retrieve current marker positions

### Admin Interface
- **URL**: http://localhost:8000/admin
- **Purpose**: Manage assets and monitor real-time position updates

## 🎯 Physical Setup

### Map Configuration
1. **Measure** the width and height of your map in **centimeters**
2. **Print** four ArUco markers with IDs **0, 1, 2, and 3**
3. **Place** corner markers:
   - Marker 0: Top-left corner
   - Marker 1: Top-right corner  
   - Marker 2: Bottom-right corner
   - Marker 3: Bottom-left corner
4. **Ensure** all markers are consistently oriented and visible to camera

### Asset Markers
- Use additional ArUco markers (IDs 4, 5, 6, etc.) for assets
- Place these markers on physical objects you want to track
- Configure corresponding assets in Django admin with matching marker IDs

## 🔧 Configuration

### Map Dimensions
Edit `opencv/main_with_backend.py`:
```python
MAP_WIDTH = 35   # Map width in cm
MAP_LENGTH = 23  # Map height in cm
```

### Backend URL
```python
BACKEND_URL = "http://localhost:8000/api/update-marker-positions/"
```

### Update Frequency
```python
UPDATE_INTERVAL = 1.0  # Send updates every 1 second
```

### Environment Variables (Docker)
Copy `backend/env.example` to `backend/.env` and configure:
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

## 📊 Usage

### 1. Start Backend
**Local:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Docker:**
```bash
cd backend
docker-compose up -d
```

### 2. Start ArUco Detection
```bash
cd opencv
python main_with_backend.py
```

### 3. Monitor Results
- **Console Output**: Real-time sync status and marker detection
- **Admin Interface**: http://localhost:8000/admin
- **API Endpoints**: Direct access to marker position data
- **JSON File**: Local backup at `opencv/marker_positions.json`

### 4. Add Assets (Optional)
1. Go to http://localhost:8000/admin
2. Login with your superuser credentials
3. Add "Asset backgrounds" (asset types)
4. Add "Assets" with matching marker IDs
5. Watch positions update in real-time

## 🧪 Testing

### Test Backend Connection
```bash
cd opencv
python test_backend_connection.py
```

### Test Basic ArUco Detection
```bash
cd opencv
python test_basic_aruco.py
```

### Manual API Testing
```bash
# Get current marker positions
curl http://localhost:8000/api/get-marker-positions/

# Update marker positions
curl -X POST http://localhost:8000/api/update-marker-positions/ \
  -H "Content-Type: application/json" \
  -d '[{"id": 4, "x": 13.37, "y": 5.07}]'
```

## 🛠️ Troubleshooting

### Common Issues

**Django Import Error**
```bash
# Make sure you're in the virtual environment
source venv/bin/activate
pip install -r requirements.txt
```

**OpenCV Import Error**
```bash
pip install opencv-python numpy
```

**Docker Issues**
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Camera Not Working**
- Check camera permissions
- Ensure no other application is using the camera
- Try different camera index: `cv2.VideoCapture(1)`

**Backend Connection Failed**
- Ensure Django server is running on port 8000
- Check firewall settings
- Verify URL in `main_with_backend.py`

**No Markers Detected**
- Ensure ArUco markers are visible to camera
- Check marker orientation
- Verify marker IDs match configuration

### Debug Mode
- Check console output for detailed error messages
- Monitor `marker_positions.json` for local data
- Use admin interface to verify database updates

## 📁 File Structure

```
tangible-community/
├── README.md              # Complete setup and usage guide
├── backend/               # Django backend
│   ├── core/             # Django project settings
│   ├── ideas/            # Main app with models and API
│   ├── manage.py         # Django management
│   ├── requirements.txt  # Python dependencies
│   ├── docker-compose.yml # Docker services
│   ├── Dockerfile        # Docker image
│   ├── setup.sh          # Docker setup script
│   ├── env.example       # Environment variables template
│   └── db.sqlite3        # SQLite database (local dev)
├── opencv/               # ArUco detection
│   ├── main_with_backend.py      # Main detection script
│   ├── detect_aruco_marker.py    # ArUco detection functions
│   ├── homography.py             # Coordinate transformation
│   ├── test_backend_connection.py # Backend testing
│   └── marker_positions.json     # Local position backup
└── README.md            # This file
```

## 🎯 Features

- ✅ Real-time ArUco marker detection
- ✅ Automatic coordinate transformation (camera → map)
- ✅ Django backend integration
- ✅ RESTful API endpoints
- ✅ Admin interface for asset management
- ✅ Real-time position updates
- ✅ Error handling and logging
- ✅ Local data backup
- ✅ Docker deployment support
- ✅ PostgreSQL database support

## 📝 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]
