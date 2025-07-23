import cv2 as cv
import numpy as np
import json

camera_folder = 'camera_1'  # Change as needed
calib_path = f'{camera_folder}/calibration_data.npz'
marker_length = 0.05  # In meters (adjust to your printed tag size)

# Load calibration data
data = np.load(calib_path)
mtx = data['mtx']
dist = data['dist']

# Start video capture
cap = cv.VideoCapture(0)  # Replace 0 with another index if needed

# Load ArUco dictionary and detection parameters
aruco_dict = cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_50)
parameters = cv.aruco.DetectorParameters()

# Get frame size for optimal new camera matrix
ret, frame = cap.read()
if not ret:
    print("Unable to read from camera")
    cap.release()
    exit()

h, w = frame.shape[:2]
newcameramtx, roi = cv.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))

print("Live ArUco tracking started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Undistort the frame
    undistorted = cv.undistort(frame, mtx, dist, None, newcameramtx)

    # Detect ArUco markers
    corners, ids, _ = cv.aruco.detectMarkers(undistorted, aruco_dict, parameters=parameters)

    if ids is not None:
        # Draw detected markers
        cv.aruco.drawDetectedMarkers(undistorted, corners, ids)

        # Estimate pose of each marker
        rvecs, tvecs, _ = cv.aruco.estimatePoseSingleMarkers(corners, marker_length, mtx, dist)

        all_marker_poses = []

        for i, marker_id in enumerate(ids.flatten()):
            rvec = rvecs[i][0].tolist()
            tvec = tvecs[i][0].tolist()

            all_marker_poses.append({
                "id": int(marker_id),
                "rvec": rvec,
                "tvec": tvec
            })

            cv.drawFrameAxes(undistorted, mtx, dist, rvecs[i], tvecs[i], 0.03)  # Axis length in meters

        with open("aruco_poses.json", "w") as f:
            json.dump(all_marker_poses, f, indent=4)

    # Show the result
    cv.imshow('Live ArUco Tracking', undistorted)

    # Exit on 'q'
    if cv.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv.destroyAllWindows()