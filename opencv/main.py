import cv2
from detect_aruco_marker import detect_aruco
from homography import compute_global_homography
import numpy as np
import json
import operator

# cm of the map (top left is going to be our origin)
marker_map = {
    0: [0, 0],       # top-left
    1: [35, 0],     # top-right
    2: [35, 23],    # bottom-right
    3: [0, 23]       # bottom-left
}

MAP_WIDTH = 35
MAP_LENGTH = 23
corner_ids = {0, 1, 2, 3}
marker_positions = {}

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
                marker_positions[int(marker_id)] = {
                    "x" : float(map_x),
                    "y" : float(map_y)
                }
            else :
                marker_positions.pop(int(marker_id), None)

    # Show the annotated video feed
    with open("marker_positions.json", "w") as f:
        json.dump(dict(sorted(marker_positions.items())), f, indent=2)


    cv2.imshow("ArUco Map View", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()