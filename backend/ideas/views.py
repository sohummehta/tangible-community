from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
import json

from .models import *
from .serializers import *

# Where we define methods to interact with the database



# class IdeaViewSet(viewsets.ModelViewSet):
#     queryset = Idea.objects.all()
#     serializer_class = IdeaSerializer 


@csrf_exempt
@api_view(['POST','GET'])
@permission_classes([AllowAny])
def updateCoordinates(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        # TODO: change depending on structure of the data
        asset_id = data.get('asset_id')
        x_pos = data.get('x_pos')
        y_pos = data.get('y_pos')

        
        asset = Asset.objects.get(id=asset_id)
        asset.x_pos = x_pos
        asset.y_pos = y_pos
        asset.save()

    return Response(status=status.HTTP_200_OK)