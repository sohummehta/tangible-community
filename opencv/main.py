import cv2
from detect_aruco_marker import detect_aruco
from homography import compute_global_homography
import numpy as np

# Define known marker positions on the physical map (in cm or arbitrary units)
marker_map = {
    0: [0, 0],       # top-left
    1: [35, 0],     # top-right
    2: [35, 23],    # bottom-right
    3: [0, 23]       # bottom-left
}

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
            center = marker_corners[0].mean(axis=0).reshape(1, 1, 2).astype(np.float32)
            map_coord = cv2.perspectiveTransform(center, H)[0][0]
            map_x, map_y = map_coord

            # Draw transformed (map) coordinates on screen
            cv2.putText(frame,
                        f"Map: ({map_x:.1f}, {map_y:.1f})",
                        (int(center[0][0][0]), int(center[0][0][1]) + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

    # Show the annotated video feed
    cv2.imshow("ArUco Map View", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()