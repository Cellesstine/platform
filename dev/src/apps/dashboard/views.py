from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from apps.accounts.models import Profile
from apps.jobs.models import Announcement
from apps.profiles.models import IndividualProfile, EnterpriseProfile


class DashboardAnnouncementSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source="enterprise.company_name", read_only=True)

    class Meta:
        model = Announcement
        fields = [
            "id",
            "enterprise_name",
            "industry",
            "role",
            "wilaya",
            "job_type",
            "status",
            "deadline",
            "created_at",
        ]


class DashboardProfessionalSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = IndividualProfile
        fields = [
            "id",
            "full_name",
            "professional_title",
            "wilaya",
            "years_experience",
            "created_at",
        ]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboardView(request):
    if not hasattr(request.user, "profile"):
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    profile = request.user.profile
    role = profile.role

    if role == Profile.Role.ENTERPRISE:
        enterprise_profile = EnterpriseProfile.objects.filter(pk=profile.pk).first()
        if enterprise_profile is None:
            return Response({"error": "Enterprise profile not found."}, status=status.HTTP_404_NOT_FOUND)

        recent_announcements = (
            Announcement.objects.select_related("enterprise")
            .filter(enterprise=enterprise_profile)
            .order_by("-created_at")[:5]
        )
        professionals = IndividualProfile.objects.order_by("-created_at")[:8]

        return Response(
            {
                "dashboard_type": "enterprise",
                "recent_announcements": DashboardAnnouncementSerializer(recent_announcements, many=True).data,
                "professional_profiles": DashboardProfessionalSerializer(professionals, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    if role == Profile.Role.INDIVIDUAL:
        recent_announcements = (
            Announcement.objects.select_related("enterprise")
            .filter(status="ACTIVE")
            .order_by("-created_at")[:8]
        )

        return Response(
            {
                "dashboard_type": "individual",
                "recent_announcements": DashboardAnnouncementSerializer(recent_announcements, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    return Response({"error": "Unsupported role."}, status=status.HTTP_400_BAD_REQUEST)


