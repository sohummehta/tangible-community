#!/usr/bin/env python
"""
Standalone script to create sample assets for testing the mapping frontend.
This script sets up the Django environment and creates sample assets with proper types and positions.
"""

import os
import sys
import django

# Add the project directory to the path and set up Django
sys.path.append('/workspace/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ideas.models import Asset, AssetBackground, Map, AssetInMap

def create_sample_data():
    print("Creating sample asset data...")
    
    # Create or get asset types
    playground_type, created = AssetBackground.objects.get_or_create(
        type_name='playground',
        defaults={
            'cost': 15000.00,
            'size': '20×15 m',
            'carbon_emission': 2.5,
            'primary_user': 'Children aged 5-12',
            'usage_patterns': 'High usage during afternoons and weekends',
            'lighting_noise': 'Good lighting required for evening use',
            'drainage_maintenance': 'Regular sand replacement and equipment inspection'
        }
    )
    print(f"Playground type: {'created' if created else 'exists'}")
    
    dogpark_type, created = AssetBackground.objects.get_or_create(
        type_name='dogpark',
        defaults={
            'cost': 25000.00,
            'size': '30×20 m',
            'carbon_emission': 1.8,
            'primary_user': 'Dog owners and pets',
            'usage_patterns': 'Morning and evening peak usage',
            'lighting_noise': 'Minimal noise concerns, basic lighting',
            'drainage_maintenance': 'Regular waste management and grass maintenance'
        }
    )
    print(f"Dog park type: {'created' if created else 'exists'}")
    
    restroom_type, created = AssetBackground.objects.get_or_create(
        type_name='restroom',
        defaults={
            'cost': 45000.00,
            'size': '6×4 m',
            'carbon_emission': 3.2,
            'primary_user': 'General public',
            'usage_patterns': 'Consistent usage throughout the day',
            'lighting_noise': 'Good lighting and ventilation required',
            'drainage_maintenance': 'Daily cleaning and regular plumbing maintenance'
        }
    )
    print(f"Restroom type: {'created' if created else 'exists'}")
    
    baseball_type, created = AssetBackground.objects.get_or_create(
        type_name='baseball',
        defaults={
            'cost': 75000.00,
            'size': '90×45 m',
            'carbon_emission': 5.5,
            'primary_user': 'Baseball teams and sports enthusiasts',
            'usage_patterns': 'Seasonal usage, peak in spring/summer',
            'lighting_noise': 'Stadium lighting for evening games',
            'drainage_maintenance': 'Field grading and irrigation system maintenance'
        }
    )
    print(f"Baseball type: {'created' if created else 'exists'}")
    
    # Create or get the default map
    default_map, created = Map.objects.get_or_create(
        name="tijuana_map",
        defaults={
            'width': 35.0,  # cm from ArUco coordinate system
            'height': 23.0  # cm from ArUco coordinate system
        }
    )
    print(f"Map: {'created' if created else 'exists'}")
    
    # Create sample assets with positions in the ArUco coordinate system (0-35 x, 0-23 y)
    assets_data = [
        {
            'name': 'Central Playground',
            'type': playground_type,
            'marker_id': 10,
            'x_pos': 12.5,  # Roughly center-left
            'y_pos': 8.0,
            'in_map': True,
            'info': {'capacity': 20, 'age_range': '5-12'}
        },
        {
            'name': 'Community Dog Park',
            'type': dogpark_type,
            'marker_id': 11,
            'x_pos': 25.0,  # Right side
            'y_pos': 15.0,
            'in_map': True,
            'info': {'fenced': True, 'water_fountain': True}
        },
        {
            'name': 'Main Restrooms',
            'type': restroom_type,
            'marker_id': 12,
            'x_pos': 8.0,   # Left side
            'y_pos': 18.0,
            'in_map': True,
            'info': {'accessible': True, 'family_room': True}
        },
        {
            'name': 'Baseball Diamond',
            'type': baseball_type,
            'marker_id': 13,
            'x_pos': 20.0,  # Center-right
            'y_pos': 5.0,
            'in_map': True,
            'info': {'lights': True, 'scoreboard': True}
        },
        {
            'name': 'East Restrooms',
            'type': restroom_type,
            'marker_id': 14,
            'x_pos': 30.0,  # Far right
            'y_pos': 12.0,
            'in_map': True,
            'info': {'accessible': False, 'maintenance_shed': True}
        }
    ]
    
    created_assets = []
    for asset_data in assets_data:
        asset, created = Asset.objects.get_or_create(
            name=asset_data['name'],
            marker_id=asset_data['marker_id'],
            defaults=asset_data
        )
        created_assets.append(asset)
        print(f"Asset '{asset.name}': {'created' if created else 'exists'} at ({asset.x_pos}, {asset.y_pos})")
    
    # Add assets to the map
    asset_in_map, created = AssetInMap.objects.get_or_create(
        map=default_map,
    )
    if created:
        asset_in_map.assets.set(created_assets)
        print(f"Added {len(created_assets)} assets to map")
    else:
        print("AssetInMap already exists")
    
    print(f"\nCreated sample data:")
    print(f"- {AssetBackground.objects.count()} asset types")
    print(f"- {Asset.objects.count()} total assets")
    print(f"- {Asset.objects.filter(in_map=True).count()} assets marked as in_map")
    print(f"- {Map.objects.count()} map(s)")
    
    print("\nAssets in map:")
    for asset in Asset.objects.filter(in_map=True):
        print(f"  - {asset.name} ({asset.type.type_name}) at ({asset.x_pos}, {asset.y_pos})")

if __name__ == '__main__':
    create_sample_data()