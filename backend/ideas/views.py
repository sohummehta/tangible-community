from rest_framework import viewsets
from .models import Idea
from .serializers import IdeaSerializer


class IdeaViewSet(viewsets.ModelViewSet):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer 