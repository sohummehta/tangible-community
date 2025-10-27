import cv2
import numpy as np
import json
import requests
import time
import threading
from datetime import datetime

camera_folder = 'camera_1'  # Change as needed
calib_path = f'{camera_folder}/calibration_data.npz'
marker_length = 0.05  # In meters (adjust to the printed tag size)

# Load calibration data
data = np.load(calib_path)
mtx = data['mtx']
dist = data['dist']

def rvec_to_degrees(rvec):
    R, _ = cv2.Rodrigues(rvec)
    yaw = np.arctan2(R[1, 0], R[0, 0]) * 180 / np.pi
    return yaw
# Import ArUco functions at module level
try:
    from detect_aruco_marker import detect_aruco
    from homography import compute_global_homography
except ImportError as e:
    print(f"Failed to import ArUco modules: {e}")
    print("Make sure detect_aruco_marker.py and homography.py are in the same directory")
    exit(1)

# Map configuration - will be loaded from backend
marker_map = {}
MAP_WIDTH = 35  # fallback values
MAP_LENGTH = 23  # fallback values

def load_map_config():
    """Load map configuration from backend API"""
    global MAP_WIDTH, MAP_LENGTH, marker_map
    
    try:
        response = requests.get("http://localhost:8000/api/map-config/", timeout=2.0)
        if response.status_code == 200:
            config = response.json()
            MAP_WIDTH = config['width']
            MAP_LENGTH = config['height']
            
            # Update marker map with new dimensions
            marker_map = {
                0: [0, 0],                    # top-left
                1: [MAP_WIDTH, 0],           # top-right
                2: [MAP_WIDTH, MAP_LENGTH],   # bottom-right
                3: [0, MAP_LENGTH]            # bottom-left
            }
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Loaded map config: {MAP_WIDTH}cm x {MAP_LENGTH}cm")
            return True
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Failed to load map config: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Error loading map config: {e}")
        return False

# Initialize with fallback values
marker_map = {
    0: [0, 0],                    # top-left
    1: [MAP_WIDTH, 0],           # top-right
    2: [MAP_WIDTH, MAP_LENGTH],   # bottom-right
    3: [0, MAP_LENGTH]            # bottom-left
}
corner_ids = {0, 1, 2, 3}
marker_positions = []
marker_dict = {}

# Backend configuration
BACKEND_URL = "http://localhost:8000/api/update-marker-positions/"
UPDATE_INTERVAL = 5.0  # Send updates every 5 second

class BackendSync:
    def __init__(self, backend_url):
        self.backend_url = backend_url
        self.last_sent_data = None
        self.lock = threading.Lock()
    
    def send_marker_positions(self, marker_positions):
        """Send marker positions to backend"""
        try:
            with self.lock:
                # Only send if data has changed
                if self.last_sent_data != marker_positions:
                    response = requests.post(
                        self.backend_url,
                        json=marker_positions,
                        headers={'Content-Type': 'application/json'},
                        timeout=2.0
                    )
                    
                    if response.status_code == 200:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sent {len(marker_positions)} marker positions to backend")
                        self.last_sent_data = marker_positions.copy()
                    else:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] Backend error: {response.status_code} - {response.text}")
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] No changes to send")
                    
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Network error: {e}")
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Error sending data: {e}")

# Initialize backend sync
backend_sync = BackendSync(BACKEND_URL)

def send_to_backend_periodically():
    """Background thread to send data to backend periodically"""
    while True:
        with backend_sync.lock:
            current_positions = marker_positions.copy()
        
        if current_positions:
            backend_sync.send_marker_positions(current_positions)
        
        time.sleep(UPDATE_INTERVAL)

# Start background thread for backend sync
backend_thread = threading.Thread(target=send_to_backend_periodically, daemon=True)
backend_thread.start()

print("Starting ArUco marker detection with backend sync...")
print(f"Backend URL: {BACKEND_URL}")
print(f"Update interval: {UPDATE_INTERVAL}s")

# Load map configuration from backend
print("Loading map configuration...")
if load_map_config():
    print("✓ Map configuration loaded successfully")
else:
    print("⚠ Using fallback map configuration")

print("Press 'q' to quit")

cap = cv2.VideoCapture(0)

ret, frame = cap.read()
if not ret:
    print("Failed to read frame from camera")
    cap.release()
    exit()

h, w = frame.shape[:2]
newcameramtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect all ArUco markers
    #Undistort the frame
    undistorted = cv2.undistort(frame, mtx, dist, None, newcameramtx)

    corners, ids = detect_aruco(undistorted)

    rvecs = []
    tvecs = []
    if ids is not None:
        for i, corner in enumerate(corners):
            # Create 3D object points for the marker
            objp = np.array([
                [-marker_length/2, -marker_length/2, 0],
                [marker_length/2, -marker_length/2, 0],
                [marker_length/2, marker_length/2, 0],
                [-marker_length/2, marker_length/2, 0]
            ], dtype=np.float32)
        
        # Solve PnP for this marker
            ret, rvec, tvec = cv2.solvePnP(objp, corner[0], mtx, dist)
            if ret:
                rvecs.append(rvec)
                tvecs.append(tvec)
            else:
                rvecs.append(None)
                tvecs.append(None)
    
    # Compute homography from camera to map if corner markers are detected
    H = compute_global_homography(corners, ids, marker_map)

    if H is not None and ids is not None:
        # Draw marker centers in map coordinates (for all markers)
        for i, (marker_corners, marker_id) in enumerate(zip(corners, ids.flatten())):
            if (marker_id in corner_ids):
                continue

            center = marker_corners[0].mean(axis=0).reshape(1, 1, 2).astype(np.float32)
            map_coord = cv2.perspectiveTransform(center, H)[0][0]
            map_x, map_y = map_coord
            
            #Calculate rotation
            rotation = 0.0
            if i < len(rvecs) and rvecs[i] is not None:
                rotation = rvec_to_degrees(rvecs[i])

            # Draw transformed (map) coordinates on screen
            if (0 <= map_x <= MAP_WIDTH and 0 <= map_y <= MAP_LENGTH):
                marker_dict[int(marker_id)] = {
                    "x": float(map_x),
                    "y": float(map_y),
                    "rotation": float(rotation)
                }
            else:
                marker_dict.pop(int(marker_id), None)

        # Update marker positions list
        marker_positions = [
            {"id": marker_id, "x": marker_data["x"], "y": marker_data["y"], "rotation": marker_data["rotation"]}
            for marker_id, marker_data in sorted(marker_dict.items())
        ]

    # Still save to local JSON file for backup/debugging
    with open("marker_positions.json", "w") as f:
        json.dump(marker_positions, f, indent=2)

    # Show the annotated video feed
    cv2.imshow("ArUco Map View", undistorted)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("ArUco detection stopped")
