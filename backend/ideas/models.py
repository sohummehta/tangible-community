from django.db import models


class Asset(models.Model):
    name = models.CharField(max_length=200) # name of the marker e.g., baseballfield_1
    type = models.CharField(max_length=200) # type of the marker (to consider multiple markers with the same type) e.g., baseballfield
    marker_id = models.IntegerField(default=999)
    x_pos = models.FloatField()
    y_pos = models.FloatField()

    in_understand = models.BooleanField(default=False)
    in_map = models.BooleanField(default=False)

    info = models.JSONField(default=dict, blank=True, null=True) # where basic information is stored, can make into fields later after we know what we need
    
    # Do we need other fields?

    def __str__(self):
        return self.type + "_" + str(self.marker_id)



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
    