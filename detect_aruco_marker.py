import cv2
import numpy as np
import sys

# Aruco dictionary we are detecting
desired_aruco_dictionary = "DICT_4X4_50"

# Predefined dictionaries in OpenCV
ARUCO_DICT = {
    "DICT_4X4_50": cv2.aruco.DICT_4X4_50,
    "DICT_4X4_100": cv2.aruco.DICT_4X4_100,
    "DICT_4X4_250": cv2.aruco.DICT_4X4_250,
    "DICT_4X4_1000": cv2.aruco.DICT_4X4_1000,
    "DICT_5X5_50": cv2.aruco.DICT_5X5_50,
    "DICT_5X5_100": cv2.aruco.DICT_5X5_100,
    "DICT_5X5_250": cv2.aruco.DICT_5X5_250,
    "DICT_6X6_50": cv2.aruco.DICT_6X6_50,
    "DICT_6X6_100": cv2.aruco.DICT_6X6_100,
    "DICT_6X6_250": cv2.aruco.DICT_6X6_250,
    "DICT_6X6_1000": cv2.aruco.DICT_6X6_1000,
    "DICT_7X7_50": cv2.aruco.DICT_7X7_50,
    "DICT_7X7_100": cv2.aruco.DICT_7X7_100,
    "DICT_7X7_250": cv2.aruco.DICT_7X7_250,
    "DICT_7X7_1000": cv2.aruco.DICT_7X7_1000,
    "DICT_ARUCO_ORIGINAL": cv2.aruco.DICT_ARUCO_ORIGINAL,
}

def main():
    # Validate dictionary
    if desired_aruco_dictionary not in ARUCO_DICT:
        print(f"[ERROR] The dictionary '{desired_aruco_dictionary}' is not supported.")
        sys.exit(1)

    print(f"[INFO] Detecting '{desired_aruco_dictionary}' markers...")

    # loading dictionary and all the parameters we would need
    dictionary = cv2.aruco.getPredefinedDictionary(ARUCO_DICT[desired_aruco_dictionary])
    parameters = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(dictionary, parameters)

    # webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam")
        sys.exit(1)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # marker detection (corners)
        corners, ids, rejected = detector.detectMarkers(frame)

        # drawing markers and their respective ID's
        if ids is not None and len(ids) > 0:
            ids = ids.flatten()
            for marker_corners, marker_id in zip(corners, ids):
                corners_reshaped = marker_corners.reshape((4, 2)).astype(int)
                (top_left, top_right, bottom_right, bottom_left) = corners_reshaped

                # creating the squares of the markers to identify it
                cv2.line(frame, top_left, top_right, (0, 255, 0), 2)
                cv2.line(frame, top_right, bottom_right, (0, 255, 0), 2)
                cv2.line(frame, bottom_right, bottom_left, (0, 255, 0), 2)
                cv2.line(frame, bottom_left, top_left, (0, 255, 0), 2)

                # drawing the center of the marker (the red dot)
                center_x = int((top_left[0] + bottom_right[0]) / 2)
                center_y = int((top_left[1] + bottom_right[1]) / 2)
                cv2.circle(frame, (center_x, center_y), 4, (0, 0, 255), -1)

                # Draw ID
                cv2.putText(frame, f"ID: {marker_id}", (top_left[0], top_left[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Show the frame
        cv2.imshow("ArUco Marker Detection", frame)

        # Exit on 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
