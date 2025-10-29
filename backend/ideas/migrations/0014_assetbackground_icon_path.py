# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0013_map_bottom_left_lat_map_bottom_left_lng_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='assetbackground',
            name='icon_path',
            field=models.CharField(blank=True, help_text='Path to icon file (e.g., /asset-images/dog_park.svg)', max_length=200, null=True),
        ),
    ]

