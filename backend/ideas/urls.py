from django.urls import path, include
from rest_framework.routers import DefaultRouter    
from .views import updateCoordinates, getAssets

# router = DefaultRouter()
# router.register(r'ideas', IdeaViewSet)

urlpatterns = [
    # path('', include(router.urls)),
    path('assets/', getAssets, name='get-assets'),
    path('update-coordinates/', updateCoordinates, name='update-coordinates'),
] 