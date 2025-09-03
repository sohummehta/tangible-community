#!/usr/bin/env python3
"""
Basic ArUco detection test - no backend dependencies
"""

import cv2
import numpy as np
import sys
import time

# Import ArUco functions at module level
try:
    from detect_aruco_marker import detect_aruco
    from homography import compute_global_homography
except ImportError as e:
    print(f"❌ Failed to import ArUco modules: {e}")
    sys.exit(1)

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        import cv2
        print("✅ OpenCV imported successfully")
    except ImportError as e:
        print(f"❌ OpenCV import failed: {e}")
        return False
    
    try:
        import numpy as np
        print("✅ NumPy imported successfully")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False
    
    try:
        from detect_aruco_marker import detect_aruco
        print("✅ detect_aruco_marker imported successfully")
    except ImportError as e:
        print(f"❌ detect_aruco_marker import failed: {e}")
        return False
    
    try:
        from homography import compute_global_homography
        print("✅ homography imported successfully")
    except ImportError as e:
        print(f"❌ homography import failed: {e}")
        return False
    
    return True

def test_camera():
    """Test if camera can be opened"""
    print("\n📷 Testing camera...")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Could not open camera")
        print("   Make sure your camera is connected and not being used by another application")
        return False
    
    # Try to read a frame
    ret, frame = cap.read()
    if not ret:
        print("❌ Could not read frame from camera")
        cap.release()
        return False
    
    print(f"✅ Camera working - frame size: {frame.shape}")
    cap.release()
    return True

def test_aruco_detection():
    """Test basic ArUco detection"""
    print("\n🎯 Testing ArUco detection...")
    
    # Configuration
    marker_map = {
        0: [0, 0],       # top-left
        1: [35, 0],     # top-right
        2: [35, 23],    # bottom-right
        3: [0, 23]       # bottom-left
    }
    
    corner_ids = {0, 1, 2, 3}
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Could not open camera for ArUco test")
        return False
    
    print("📹 Starting camera feed...")
    print("   Show some ArUco markers to the camera")
    print("   Press 'q' to quit")
    
    frame_count = 0
    start_time = time.time()
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("❌ Could not read frame")
                break
            
            frame_count += 1
            
            # Detect ArUco markers
            try:
                corners, ids = detect_aruco(frame)
                
                if ids is not None:
                    print(f"📍 Frame {frame_count}: Detected {len(ids)} markers with IDs: {ids.flatten()}")
                    
                    # Test homography if corner markers are detected
                    try:
                        H = compute_global_homography(corners, ids, marker_map)
                        if H is not None:
                            print(f"   ✅ Homography computed successfully")
                        else:
                            print(f"   ⚠️  Could not compute homography (need corner markers)")
                    except Exception as e:
                        print(f"   ❌ Homography error: {e}")
                else:
                    if frame_count % 30 == 0:  # Print every 30 frames
                        print(f"📍 Frame {frame_count}: No markers detected")
                        
            except Exception as e:
                print(f"❌ ArUco detection error: {e}")
            
            # Display frame
            cv2.imshow("ArUco Test", frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("\n👋 Stopped by user")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        
        elapsed_time = time.time() - start_time
        fps = frame_count / elapsed_time if elapsed_time > 0 else 0
        print(f"📊 Test completed: {frame_count} frames in {elapsed_time:.1f}s ({fps:.1f} FPS)")
    
    return True

def main():
    print("🧪 Basic ArUco Detection Test")
    print("=" * 40)
    
    # Test 1: Imports
    if not test_imports():
        print("\n❌ Import test failed. Please install required packages:")
        print("   pip install opencv-python numpy")
        return
    
    # Test 2: Camera
    if not test_camera():
        print("\n❌ Camera test failed. Please check your camera connection.")
        return
    
    # Test 3: ArUco detection
    print("\n🚀 Starting ArUco detection test...")
    test_aruco_detection()
    
    print("\n✅ Basic test completed!")

if __name__ == "__main__":
    main()
