from django.shortcuts import get_object_or_404
from django.db.models import Q, Count

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Announcement, Application

from .serializers import (
    AnnouncementSerializer,
    AnnouncementListSerializer,
    AnnouncementDetailSerializer,
    ApplicationSerializer,
    ApplicationDetailsSerializer,
    ApplicationStatusSerializer,
)

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def announcement_list_create(request):
    if request.method == "GET":
        qs = (
            Announcement.objects
            .select_related("enterprise")
            .prefetch_related("required_skills")
            .annotate(applicant_count=Count("applications"))
        )

        st         = request.query_params.get("status", "ACTIVE").upper()
        industry   = request.query_params.get("industry")
        role       = request.query_params.get("role")
        wilaya     = request.query_params.get("wilaya")
        job_type   = request.query_params.get("job_type")
        enterprise = request.query_params.get("enterprise")
        search     = request.query_params.get("search")

        if st != "ALL":
            qs = qs.filter(status=st)
        if industry:
            qs = qs.filter(industry=industry.upper())
        if role:
            qs = qs.filter(role=role.upper())
        if wilaya:
            qs = qs.filter(wilaya=wilaya)
        if job_type:
            qs = qs.filter(job_type=job_type.upper())
        if enterprise:
            qs = qs.filter(enterprise_id=enterprise)
        if search:
            qs = qs.filter(
                Q(description__icontains=search)           |
                Q(address__icontains=search)               |
                Q(role__icontains=search)                  |
                Q(enterprise__company_name__icontains=search) |
                Q(required_skills__name__icontains=search)
            ).distinct()

        serializer = AnnouncementListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if not hasattr(request.user, "profile") or not hasattr(request.user.profile, "enterpriseprofile"):
        return Response({"error": "Enterprise profile required."}, status=status.HTTP_403_FORBIDDEN)
    if not request.user.profile.enterpriseprofile.verified:
        return Response(
            {"error": "Account pending verification. You cannot post announcements until approved by admin."},
            status=status.HTTP_403_FORBIDDEN
        )

    payload = request.data.copy()
    payload["enterprise"] = str(request.user.profile.enterpriseprofile.id)
    serializer = AnnouncementSerializer(data=payload)
    if serializer.is_valid():
        announcement = serializer.save()
        return Response(
            AnnouncementDetailSerializer(announcement).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([AllowAny])
def announcement_search(request):
    qs = (
        Announcement.objects
        .select_related("enterprise")
        .prefetch_related("required_skills")
        .annotate(applicant_count=Count("applications"))
    )

    q        = request.query_params.get("q")
    industry = request.query_params.get("industry")
    role     = request.query_params.get("role")
    wilaya   = request.query_params.get("wilaya")
    job_type = request.query_params.get("job_type")
    st       = request.query_params.get("status", "ACTIVE").upper()
    exp_max  = request.query_params.get("exp_max")

    if st != "ALL":
        qs = qs.filter(status=st)
    if industry:
        qs = qs.filter(industry=industry.upper())
    if role:
        qs = qs.filter(role=role.upper())
    if wilaya:
        qs = qs.filter(wilaya=wilaya)
    if job_type:
        qs = qs.filter(job_type=job_type.upper())
    if exp_max:
        qs = qs.filter(
            Q(experience_required__lte=exp_max) |
            Q(experience_required__isnull=True)
        )
    if q:
        qs = qs.filter(
            Q(description__icontains=q)                    |
            Q(address__icontains=q)                        |
            Q(role__icontains=q)                           |
            Q(industry__icontains=q)                       |
            Q(enterprise__company_name__icontains=q)       |
            Q(required_skills__name__icontains=q)
        ).distinct()

    results = list(qs)
    serializer = AnnouncementListSerializer(results, many=True, context={"request": request})
    return Response({
        "count":   len(results),
        "results": serializer.data,
    })

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def announcement_detail(request, pk):
    announcement = get_object_or_404(
        Announcement.objects
            .select_related("enterprise")
            .prefetch_related("required_skills"),
        pk=pk,
    )

    if request.method == "GET":
        return Response(AnnouncementDetailSerializer(announcement, context={"request": request}).data)

    # Protect write operations
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    # Check if the user has an enterprise profile and owns the announcement
    if not hasattr(request.user, "profile") or not hasattr(request.user.profile, "enterpriseprofile") or request.user.profile.enterpriseprofile != announcement.enterprise:
        return Response({"error": "You do not have permission to modify this announcement."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "DELETE":
        announcement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial    = (request.method == "PATCH")
    serializer = AnnouncementSerializer(
        announcement, data=request.data, partial=partial
    )
    if serializer.is_valid():
        updated = serializer.save()
        return Response(AnnouncementDetailSerializer(updated, context={"request": request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def announcement_publish(request, pk):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if not hasattr(request.user, "profile") or not hasattr(request.user.profile, "enterpriseprofile"):
        return Response({"error": "Enterprise profile required."}, status=status.HTTP_403_FORBIDDEN)
    if not request.user.profile.enterpriseprofile.verified:
        return Response(
            {"error": "Account pending verification. You cannot post announcements until approved by admin."},
            status=status.HTTP_403_FORBIDDEN
        )

    announcement = get_object_or_404(Announcement, pk=pk)

    if announcement.is_active():
        return Response(
            {"detail": "Announcement is already active."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if announcement.is_closed():
        return Response(
            {"detail": "A closed announcement cannot be re-published."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    announcement.publish()   # delegates to model method — single place to change
    return Response(AnnouncementDetailSerializer(announcement, context={"request": request}).data)


@api_view(["POST"])
def announcement_close(request, pk):
    announcement = get_object_or_404(Announcement, pk=pk)

    if announcement.is_closed():
        return Response(
            {"detail": "Announcement is already closed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    announcement.close()
    return Response(AnnouncementDetailSerializer(announcement, context={"request": request}).data)

@api_view(["GET", "POST"])
def application_list_create(request):
    if request.method == "GET":
        qs = (
            Application.objects
            .select_related("announcement", "announcement__enterprise", "applicant", "applicant__user")
            .prefetch_related("applicant__skills__skill")
        )

        announcement_id = request.query_params.get("announcement")
        applicant_id    = request.query_params.get("applicant")
        st              = request.query_params.get("status")

        if announcement_id:
            qs = qs.filter(announcement_id=announcement_id)
        if applicant_id:
            qs = qs.filter(applicant_id=applicant_id)
        if st:
            qs = qs.filter(status=st.upper())

        serializer = ApplicationDetailsSerializer(qs.order_by("-created_at"), many=True, context={"request": request})
        return Response(serializer.data)

    serializer = ApplicationSerializer(data=request.data)
    if serializer.is_valid():
        application = serializer.save()
        return Response(
            ApplicationDetailsSerializer(application, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def application_search(request):
    qs = (
        Application.objects
        .select_related(
            "announcement",
            "announcement__enterprise",
            "applicant",
            "applicant__user",
        )
        .prefetch_related("applicant__skills__skill")
    )

    q               = request.query_params.get("q")
    st              = request.query_params.get("status")
    announcement_id = request.query_params.get("announcement")
    applicant_id    = request.query_params.get("applicant")

    if st:
        qs = qs.filter(status=st.upper())
    if announcement_id:
        qs = qs.filter(announcement_id=announcement_id)
    if applicant_id:
        qs = qs.filter(applicant_id=applicant_id)
    if q:
        qs = qs.filter(
            Q(cover_letter__icontains=q)                              |
            Q(announcement__description__icontains=q)                 |
            Q(announcement__enterprise__company_name__icontains=q)    |
            Q(applicant__first_name__icontains=q)                     |
            Q(applicant__last_name__icontains=q)
        ).distinct()

    results    = list(qs.order_by("-created_at"))
    serializer = ApplicationDetailsSerializer(results, many=True, context={"request": request})
    return Response({
        "count":   len(results),
        "results": serializer.data,
    })

@api_view(["GET", "DELETE"])
def application_detail(request, pk):
    application = get_object_or_404(
        Application.objects.select_related(
            "announcement", "announcement__enterprise", "applicant"
        ).prefetch_related("applicant__skills__skill"),
        pk=pk,
    )

    if request.method == "GET":
        return Response(ApplicationDetailsSerializer(application, context={"request": request}).data)

    application.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["PATCH"])
def application_reviewed(request, pk):
    application = get_object_or_404(Application, pk=pk)

    serializer = ApplicationStatusSerializer(
        application,
        data={"status": "REVIEWED"},
        partial=True,
    )
    if serializer.is_valid():
        application.mark_reviewed()
        return Response(ApplicationDetailsSerializer(application, context={"request": request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
def application_accept(request, pk):

    application = get_object_or_404(Application, pk=pk)

    serializer = ApplicationStatusSerializer(
        application,
        data={"status": "ACCEPTED"},
        partial=True,
    )
    if serializer.is_valid():
        application.accept()
        return Response(ApplicationDetailsSerializer(application, context={"request": request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
def application_reject(request, pk):
    application = get_object_or_404(Application, pk=pk)

    serializer = ApplicationStatusSerializer(
        application,
        data={"status": "REJECTED"},
        partial=True,
    )
    if serializer.is_valid():
        application.reject()
        return Response(ApplicationDetailsSerializer(application, context={"request": request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)