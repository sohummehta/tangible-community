from django.contrib import admin
from .models import Asset, Map, AssetInMap


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'id', 'x_pos', 'y_pos', 'in_understand', 'in_map')
    list_filter = ('type', 'in_understand', 'in_map')
    search_fields = ('name', 'type')
    readonly_fields = ('id',)


@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    list_display = ('name', 'width', 'height')
    search_fields = ('name',)


@admin.register(AssetInMap)
class AssetInMapAdmin(admin.ModelAdmin):
    list_display = ('map', 'get_asset_count')
    filter_horizontal = ('assets',)
    
    def get_asset_count(self, obj):
        return obj.assets.count()
    get_asset_count.short_description = 'Number of Assets' 