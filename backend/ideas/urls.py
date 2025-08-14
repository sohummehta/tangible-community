from django.urls import path, include
from rest_framework.routers import DefaultRouter    
from .views import updateCoordinates

# router = DefaultRouter()
# router.register(r'ideas', IdeaViewSet)

urlpatterns = [
    # path('', include(router.urls)),

    path('update-coordinates/', updateCoordinates, name='update-coordinates'),
] 