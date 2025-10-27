from rest_framework import serializers
from .models import Asset, Map, AssetInMap


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'


class MapSerializer(serializers.ModelSerializer):
    geographic_bounds = serializers.ReadOnlyField()
    
    class Meta:
        model = Map
        fields = ['id', 'name', 'width', 'height', 'geographic_bounds', 'config_version', 'updated_at']


class MapConfigSerializer(serializers.ModelSerializer):
    """Simplified serializer for map configuration API"""
    geographic_bounds = serializers.ReadOnlyField()
    
    class Meta:
        model = Map
        fields = ['width', 'height', 'geographic_bounds', 'config_version']


class AssetInMapSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssetInMap
        fields = '__all__' 