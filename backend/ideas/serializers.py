from rest_framework import serializers
from .models import Asset, Map, AssetInMap, AssetBackground


class AssetBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetBackground
        fields = '__all__'


class AssetSerializer(serializers.ModelSerializer):
    type = AssetBackgroundSerializer(read_only=True)
    
    class Meta:
        model = Asset
        fields = '__all__'


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = '__all__'


class AssetInMapSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssetInMap
        fields = '__all__' 