# Generated manually - Data migration to populate icon_path based on typeMap

from django.db import migrations


def populate_icon_paths(apps, schema_editor):
    """
    Populate icon_path for existing AssetBackground entries based on type_name.
    This replicates the typeMap logic from the frontend.
    """
    AssetBackground = apps.get_model('ideas', 'AssetBackground')
    
    # This is the typeMap from leaflet.tsx, translated to Python
    type_map = {
        'playground': '/asset-images/playground.svg',
        'dogpark': '/asset-images/dog_park.svg',
        'dog park': '/asset-images/dog_park.svg',
        'restroom': '/asset-images/restroom.svg',
        'baseball': '/asset-images/baseball.svg',
        'baseball field': '/asset-images/baseball.svg',
        'soccer': '/asset-images/soccer_field.svg',
        'soccer field': '/asset-images/soccer_field.svg',
        'tennis': '/asset-images/tennis.svg',
        'tennis court': '/asset-images/tennis.svg',
        'tennis courts': '/asset-images/tennis.svg',
        'Tennis': '/asset-images/tennis.svg',
        'Tennis Court': '/asset-images/tennis.svg',
        'Tennis Courts': '/asset-images/tennis.svg',
        'pickleball': '/asset-images/pickleball.svg',
        'picnic': '/asset-images/picnic_shelter.svg',
        'picnic shelter': '/asset-images/picnic_shelter.svg',
        'amphitheater': '/asset-images/ampitheater.svg',
        'nature play': '/asset-images/nature play.svg',
        'public art': '/asset-images/public_art.svg',
        'sculpture': '/asset-images/sculpture.svg',
    }
    
    # Default icon path
    default_icon = '/asset-images/playground.svg'
    
    # Update all AssetBackground entries
    for asset_background in AssetBackground.objects.all():
        type_name = asset_background.type_name
        
        if type_name:
            # Try exact match first
            icon_path = type_map.get(type_name)
            
            # If no exact match, try case-insensitive lookup
            if not icon_path:
                normalized_type = type_name.lower().strip()
                icon_path = type_map.get(normalized_type)
            
            # Fall back to default if still no match
            if not icon_path:
                icon_path = default_icon
            
            asset_background.icon_path = icon_path
            asset_background.save()


def reverse_populate_icon_paths(apps, schema_editor):
    """
    Reverse migration - clear icon_path values
    """
    AssetBackground = apps.get_model('ideas', 'AssetBackground')
    AssetBackground.objects.all().update(icon_path=None)


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0014_assetbackground_icon_path'),
    ]

    operations = [
        migrations.RunPython(populate_icon_paths, reverse_populate_icon_paths),
    ]

