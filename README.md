# Tangible Community Setup

## Install the following:

```
pip install opencv-contrib-python 
```

Preparing the physical layout

- Measure the **width** and **height** of the map in **centimeters**.
- Print **four ArUco markers** with IDs **0, 1, 2, and 3**.
- Tape each marker so its **top-left corner aligns with the corresponding corner of the map**.
- Keep all markers consistently oriented (not rotated randomly).
- Ensure the camera can see all four markers clearly in its frame.

---

## Running the Code

To run the full pipeline:

```bash
python opencv/main.py
```

This script does the following:
- Uses the webcam to detect the ArUco markers.
- Automatically calculates the homography matrix using `homography.py`.
- Updates and saves real-world corner coordinates in `marker_positions.json`.
