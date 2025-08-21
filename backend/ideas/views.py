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


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def updateMarkerPositions(request):
    """
    Update marker positions from ArUco detection system
    Expected format: [{"id": marker_id, "x": x_pos, "y": y_pos}, ...]
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            if not isinstance(data, list):
                return Response(
                    {"error": "Expected list of marker positions"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            updated_count = 0
            for marker_data in data:
                marker_id = marker_data.get('id')
                x_pos = marker_data.get('x')
                y_pos = marker_data.get('y')
                
                if marker_id is not None and x_pos is not None and y_pos is not None:
                    # Find assets with this marker_id and update their positions
                    assets = Asset.objects.filter(marker_id=marker_id)
                    for asset in assets:
                        asset.x_pos = x_pos
                        asset.y_pos = y_pos
                        asset.save()
                        updated_count += 1
            
            return Response({
                "message": f"Updated {updated_count} assets",
                "markers_processed": len(data)
            }, status=status.HTTP_200_OK)
            
        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid JSON format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def getMarkerPositions(request):
    """
    Get current marker positions for all assets
    """
    assets = Asset.objects.filter(marker_id__isnull=False).exclude(marker_id=999)
    
    marker_positions = []
    for asset in assets:
        marker_positions.append({
            "id": asset.marker_id,
            "x": asset.x_pos,
            "y": asset.y_pos,
            "asset_name": asset.name,
            "asset_type": asset.type.type_name if asset.type else None
        })
    
    return Response(marker_positions, status=status.HTTP_200_OK)