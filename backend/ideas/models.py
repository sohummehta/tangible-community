from django.db import models


class Asset(models.Model):
    name = models.CharField(max_length=200) # name of the marker e.g., baseballfield_1
    type = models.ForeignKey(
        'ideas.AssetBackground',
        on_delete=models.PROTECT,
        related_name = 'assets',
        verbose_name= 'type/background',
    ) # type of the marker (to consider multiple markers with the same type) e.g., baseballfield
    marker_id = models.IntegerField(default=999)
    x_pos = models.FloatField()
    y_pos = models.FloatField()

    in_understand = models.BooleanField(default=False)
    in_map = models.BooleanField(default=False)

    info = models.JSONField(default=dict, blank=True, null=True) # where basic information is stored, can make into fields later after we know what we need
    
    # Do we need other fields?

    def __str__(self):
        return f"{self.type.type_name}_{self.marker_id}"



class Map(models.Model):
    name = models.CharField(default="tijuana_map")
    width = models.FloatField()
    height = models.FloatField()

    def __str__(self):
        return self.name



# Check how many assets are in the map
class AssetInMap(models.Model):
    assets = models.ManyToManyField(Asset)
    map = models.ForeignKey(Map, on_delete=models.CASCADE)

class AssetBackground(models.Model):
    type_name = models.CharField(max_length = 100, unique= True,)

    cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Total cost")
    size = models.CharField(max_length=100, blank=True, help_text='e.g., "20×40 m" or "800 m²"')
    carbon_emission = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Estimated kg CO₂e")

    has_context = models.BooleanField(default=False, help_text="Check if context applies")
    context = models.TextField(blank=True)

    primary_user = models.CharField(max_length=200, blank=True, help_text="Intended population / primary user")
    usage_patterns = models.TextField(blank=True)
    lighting_noise = models.TextField(blank=True, help_text="Lighting / noise considerations")
    drainage_maintenance = models.TextField(blank=True, help_text="Drainage / maintenance requirements")

    nearby_assets_40_miles = models.PositiveIntegerField(default=0, help_text="Count of similar assets within 40 miles")

    created_at = models.DateTimeField(auto_now_add=True) #don't know if we need these two
    updated_at = models.DateTimeField(auto_now=True) #same as above

    def __str__(self):
        #return f"Background for {self.asset}"
        return self.type_name
    