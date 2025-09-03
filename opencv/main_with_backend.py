import cv2
import numpy as np
import json
import requests
import time
import threading
from datetime import datetime

# Import ArUco functions at module level
try:
    from detect_aruco_marker import detect_aruco
    from homography import compute_global_homography
except ImportError as e:
    print(f"❌ Failed to import ArUco modules: {e}")
    print("   Make sure detect_aruco_marker.py and homography.py are in the same directory")
    exit(1)

# cm of the map (top left is going to be our origin)
marker_map = {
    0: [0, 0],       # top-left
    1: [35, 0],     # top-right
    2: [35, 23],    # bottom-right
    3: [0, 23]       # bottom-left
}

# Change this for each map that's going to be used
MAP_WIDTH = 35
MAP_LENGTH = 23
corner_ids = {0, 1, 2, 3}
marker_positions = []
marker_dict = {}

# Backend configuration
BACKEND_URL = "http://localhost:8000/api/update-marker-positions/"
UPDATE_INTERVAL = 1.0  # Send updates every 1 second

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
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Sent {len(marker_positions)} marker positions to backend")
                        self.last_sent_data = marker_positions.copy()
                    else:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Backend error: {response.status_code} - {response.text}")
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ⏭️  No changes to send")
                    
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Network error: {e}")
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Error sending data: {e}")

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

print("🚀 Starting ArUco marker detection with backend sync...")
print(f"📡 Backend URL: {BACKEND_URL}")
print(f"⏱️  Update interval: {UPDATE_INTERVAL}s")
print("Press 'q' to quit")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect all ArUco markers
    corners, ids = detect_aruco(frame)

    # Compute homography from camera to map if corner markers are detected
    H = compute_global_homography(corners, ids, marker_map)

    if H is not None and ids is not None:
        # Draw marker centers in map coordinates (for all markers)
        for marker_corners, marker_id in zip(corners, ids.flatten()):
            if (marker_id in corner_ids):
                continue

            center = marker_corners[0].mean(axis=0).reshape(1, 1, 2).astype(np.float32)
            map_coord = cv2.perspectiveTransform(center, H)[0][0]
            map_x, map_y = map_coord

            # Draw transformed (map) coordinates on screen
            if (0 <= map_x <= MAP_WIDTH and 0 <= map_y <= MAP_LENGTH):
                marker_dict[int(marker_id)] = {
                    "x": float(map_x),
                    "y": float(map_y)
                }
            else:
                marker_dict.pop(int(marker_id), None)

        # Update marker positions list
        marker_positions = [
            {"id": marker_id, "x": data["x"], "y": data["y"]}
            for marker_id, data in sorted(marker_dict.items())
        ]

    # Still save to local JSON file for backup/debugging
    with open("marker_positions.json", "w") as f:
        json.dump(marker_positions, f, indent=2)

    # Show the annotated video feed
    cv2.imshow("ArUco Map View", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("👋 ArUco detection stopped")
