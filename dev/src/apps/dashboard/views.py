from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from apps.accounts.utils import (
    ROLE_MAP,
    )

from apps.profiles.models import (
    Profile,
    IndividualProfile,
    EnterpriseProfile,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboardView(request):
    role_param = request.data.get("role")
    if role_param not in ROLE_MAP:
        return Response({
            "error": "invalid role"
            }, status=HTTP_400_BAD_REQUEST
            )

    role = ROLE_MAP[role_param]
    if role == request.user.Profile.role.INDIVIDUAL:
        queryset = EnterpriseProfile.objects.all()
    else:
        queryset = IndividualProfile.objects.all()

    return Response({
        "queryset": queryset,
        })


