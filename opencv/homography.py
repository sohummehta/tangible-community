import cv2
import numpy as np

def compute_global_homography(corners, ids, marker_map):
    """
    Compute the homography matrix from camera view to map coordinates.

    Parameters:
        corners (list): List of 4x2 arrays of marker corners (from detectMarkers).
        ids (np.ndarray): Corresponding marker IDs.
        marker_map (dict): Dictionary of form {marker_id: (x, y)} representing known map positions.

    Returns:
        H (3x3 np.ndarray): Homography matrix, or None if not all corner markers are found.
    """
    if ids is None:
        return None

    # Prepare source and destination point lists
    src_pts = []
    dst_pts = []

    ids = ids.flatten()

    for marker_corners, marker_id in zip(corners, ids):
        if marker_id in marker_map:
            # Use top-left corner of the marker
            pts = marker_corners.reshape((4, 2))
            top_left = pts[0]

            src_pts.append(top_left)
            dst_pts.append(marker_map[marker_id])

    if len(src_pts) < 4:
        # Not enough markers detected for a valid homography
        return None

    src_pts = np.array(src_pts, dtype=np.float32)
    dst_pts = np.array(dst_pts, dtype=np.float32)

    H, _ = cv2.findHomography(src_pts, dst_pts)

    return H
