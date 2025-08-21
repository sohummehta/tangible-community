from django.urls import path, include
from rest_framework.routers import DefaultRouter    
from .views import updateCoordinates, updateMarkerPositions, getMarkerPositions

# router = DefaultRouter()
# router.register(r'ideas', IdeaViewSet)

urlpatterns = [
    # path('', include(router.urls)),

    path('update-coordinates/', updateCoordinates, name='update-coordinates'),
    path('update-marker-positions/', updateMarkerPositions, name='update-marker-positions'),
    path('get-marker-positions/', getMarkerPositions, name='get-marker-positions'),
] 