#!/usr/bin/env python3
"""
Test script to verify backend connection and API endpoints
"""

import requests
import json
import time

# Backend configuration
BACKEND_BASE_URL = "http://localhost:8000"
UPDATE_ENDPOINT = f"{BACKEND_BASE_URL}/api/update-marker-positions/"
GET_ENDPOINT = f"{BACKEND_BASE_URL}/api/get-marker-positions/"

def test_backend_connection():
    """Test if backend is running and accessible"""
    try:
        response = requests.get(f"{BACKEND_BASE_URL}/", timeout=5)
        print(f"✅ Backend is accessible (Status: {response.status_code})")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_update_marker_positions():
    """Test the update marker positions endpoint"""
    # Sample marker data
    test_markers = [
        {"id": 4, "x": 13.37, "y": 5.07},
        {"id": 5, "x": 7.67, "y": 9.87},
        {"id": 6, "x": 28.32, "y": 10.69}
    ]
    
    try:
        response = requests.post(
            UPDATE_ENDPOINT,
            json=test_markers,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"✅ Update endpoint working: {response.json()}")
            return True
        else:
            print(f"❌ Update endpoint error: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Update endpoint failed: {e}")
        return False

def test_get_marker_positions():
    """Test the get marker positions endpoint"""
    try:
        response = requests.get(GET_ENDPOINT, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get endpoint working: Found {len(data)} assets with markers")
            for asset in data:
                print(f"   - {asset['asset_name']} (ID: {asset['id']}) at ({asset['x']:.2f}, {asset['y']:.2f})")
            return True
        else:
            print(f"❌ Get endpoint error: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Get endpoint failed: {e}")
        return False

def simulate_realtime_updates():
    """Simulate real-time marker position updates"""
    print("\n🔄 Simulating real-time updates...")
    
    # Simulate marker movement
    base_positions = [
        {"id": 4, "x": 13.37, "y": 5.07},
        {"id": 5, "x": 7.67, "y": 9.87},
        {"id": 6, "x": 28.32, "y": 10.69}
    ]
    
    for i in range(5):
        # Add some movement to simulate real-time updates
        updated_positions = []
        for marker in base_positions:
            updated_positions.append({
                "id": marker["id"],
                "x": marker["x"] + (i * 0.1),
                "y": marker["y"] + (i * 0.05)
            })
        
        try:
            response = requests.post(
                UPDATE_ENDPOINT,
                json=updated_positions,
                headers={'Content-Type': 'application/json'},
                timeout=2
            )
            
            if response.status_code == 200:
                print(f"   Update {i+1}/5: ✅ {response.json()}")
            else:
                print(f"   Update {i+1}/5: ❌ {response.status_code}")
                
        except Exception as e:
            print(f"   Update {i+1}/5: ❌ {e}")
        
        time.sleep(1)

def main():
    print("🧪 Testing Backend Connection and API Endpoints")
    print("=" * 50)
    
    # Test 1: Backend connection
    if not test_backend_connection():
        print("\n❌ Backend is not running. Please start the Django server first:")
        print("   cd backend && python manage.py runserver")
        return
    
    print()
    
    # Test 2: Update endpoint
    test_update_marker_positions()
    print()
    
    # Test 3: Get endpoint
    test_get_marker_positions()
    print()
    
    # Test 4: Simulate real-time updates
    simulate_realtime_updates()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()
