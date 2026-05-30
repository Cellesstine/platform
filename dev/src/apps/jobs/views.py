from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Announcement, Application
from .serializers import (
    AnnouncementSerializer,
    AnnouncementListSerializer,
    AnnouncementDetailSerializer,
    ApplicationSerializer,
    ApplicationDetailsSerializer,
)
from .utils import ApplicationStatus


# ─────────────────────────────────────────────
# Announcement — List / Create
# ─────────────────────────────────────────────

@api_view(["GET", "POST"])
def announcement_list_create(request):
    """
    GET  /api/jobs/   — list announcements
    POST /api/jobs/   — create an announcement
    """
    if request.method == "GET":
        qs = Announcement.objects.select_related("enterprise").prefetch_related("required_skills")

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
                Q(description__icontains=search) |
                Q(address__icontains=search) |
                Q(enterprise__company_name__icontains=search)
            )

        serializer = AnnouncementListSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = AnnouncementSerializer(data=request.data)
    if serializer.is_valid():
        post = serializer.save()
        detail_serializer = AnnouncementDetailSerializer(post)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# Announcement — Search
# ─────────────────────────────────────────────

@api_view(["GET"])
def announcement_search(request):
    """
    GET /api/jobs/search/
    """
    qs = Announcement.objects.select_related("enterprise").prefetch_related("required_skills")

    q         = request.query_params.get("q")
    industry  = request.query_params.get("industry")
    role      = request.query_params.get("role")
    wilaya    = request.query_params.get("wilaya")
    job_type  = request.query_params.get("job_type")
    st        = request.query_params.get("status", "ACTIVE").upper()
    exp_max   = request.query_params.get("exp_max")

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
    if exp_max is not None:
        try:
            exp_max = int(exp_max)
        except (TypeError, ValueError):
            return Response(
                {"exp_max": "Must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = qs.filter(
            Q(experience_required__lte=exp_max) | Q(experience_required__isnull=True)
        )
    if q:
        qs = qs.filter(
            Q(description__icontains=q) |
            Q(address__icontains=q) |
            Q(role__icontains=q) |
            Q(industry__icontains=q) |
            Q(enterprise__company_name__icontains=q) |
            Q(required_skills__name__icontains=q)
        ).distinct()

    results = list(qs)
    serializer = AnnouncementListSerializer(results, many=True)
    return Response({
        "count": len(results),
        "results": serializer.data,
    })


# ─────────────────────────────────────────────
# Announcement — Retrieve / Update / Delete
# ─────────────────────────────────────────────

@api_view(["GET", "PUT", "PATCH", "DELETE"])
def announcement_detail(request, pk):
    """
    GET    /api/jobs/<id>/
    PUT    /api/jobs/<id>/
    PATCH  /api/jobs/<id>/
    DELETE /api/jobs/<id>/
    """
    post = get_object_or_404(
        Announcement.objects.select_related("enterprise").prefetch_related("required_skills"),
        pk=pk,
    )

    if request.method == "GET":
        serializer = AnnouncementDetailSerializer(post)
        return Response(serializer.data)

    if request.method == "DELETE":
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial = request.method == "PATCH"
    serializer = AnnouncementSerializer(post, data=request.data, partial=partial)
    if serializer.is_valid():
        updated_post = serializer.save()
        detail_serializer = AnnouncementDetailSerializer(updated_post)
        return Response(detail_serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# Announcement — Publish / Close
# ─────────────────────────────────────────────

@api_view(["POST"])
def announcement_publish(request, pk):
    """POST /api/jobs/<id>/publish/"""
    post = get_object_or_404(Announcement, pk=pk)
    if post.is_active():
        return Response(
            {"detail": "Announcement is already active."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    post.publish()
    serializer = AnnouncementDetailSerializer(post)
    return Response(serializer.data)


@api_view(["POST"])
def announcement_close(request, pk):
    """POST /api/jobs/<id>/close/"""
    post = get_object_or_404(Announcement, pk=pk)
    if post.is_closed():
        return Response(
            {"detail": "Announcement is already closed."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    post.close()
    serializer = AnnouncementDetailSerializer(post)
    return Response(serializer.data)


# ─────────────────────────────────────────────
# Applications — List / Create
# ─────────────────────────────────────────────

@api_view(["GET", "POST"])
def application_list_create(request):
    """
    GET  /api/jobs/applications/?announcement=<id>  — list applications for an announcement
    GET  /api/jobs/applications/?applicant=<id>     — list applications by an applicant
    POST /api/jobs/applications/                    — submit an application
    """
    if request.method == "GET":
        announcement_id = request.query_params.get("announcement")
        applicant_id    = request.query_params.get("applicant")
        st              = request.query_params.get("status")

        if not announcement_id and not applicant_id:
            return Response(
                {"detail": "Provide ?announcement= or ?applicant= to list applications."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = Application.objects.select_related("announcement", "applicant")

        if announcement_id:
            qs = qs.filter(announcement_id=announcement_id)
        if applicant_id:
            qs = qs.filter(applicant_id=applicant_id)
        if st:
            qs = qs.filter(status=st.upper())

        serializer = ApplicationDetailsSerializer(qs.order_by("-created_at"), many=True)
        return Response(serializer.data)

    serializer = ApplicationSerializer(data=request.data)
    if serializer.is_valid():
        app = serializer.save()
        detail_serializer = ApplicationDetailsSerializer(app)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# Applications — Search
# ─────────────────────────────────────────────

@api_view(["GET"])
def application_search(request):
    """
    GET /api/jobs/applications/search/
    """
    qs = Application.objects.select_related(
        "announcement", "applicant", "announcement__enterprise"
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
            Q(cover_letter__icontains=q) |
            Q(announcement__description__icontains=q) |
            Q(announcement__enterprise__company_name__icontains=q) |
            Q(applicant__first_name__icontains=q) |
            Q(applicant__last_name__icontains=q)
        ).distinct()

    results = list(qs.order_by("-created_at"))
    serializer = ApplicationDetailsSerializer(results, many=True)
    return Response({
        "count": len(results),
        "results": serializer.data,
    })


# ─────────────────────────────────────────────
# Applications — Retrieve / Delete
# ─────────────────────────────────────────────

@api_view(["GET", "DELETE"])
def application_detail(request, pk):
    """
    GET    /api/jobs/applications/<id>/
    DELETE /api/jobs/applications/<id>/  — withdraw application
    """
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )

    if request.method == "GET":
        serializer = ApplicationDetailsSerializer(app)
        return Response(serializer.data)

    app.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Applications — Status Actions
# ─────────────────────────────────────────────

@api_view(["PATCH"])
def application_reviewed(request, pk):
    """PATCH /api/jobs/applications/<id>/reviewed/"""
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )
    app.status = ApplicationStatus.REVIEWED
    app.save(update_fields=["status", "updated_at"])
    serializer = ApplicationDetailsSerializer(app)
    return Response(serializer.data)


@api_view(["PATCH"])
def application_accept(request, pk):
    """PATCH /api/jobs/applications/<id>/accept/"""
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )
    app.status = ApplicationStatus.ACCEPTED
    app.save(update_fields=["status", "updated_at"])
    serializer = ApplicationDetailsSerializer(app)
    return Response(serializer.data)


@api_view(["PATCH"])
def application_reject(request, pk):
    """PATCH /api/jobs/applications/<id>/reject/"""
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )
    app.status = ApplicationStatus.REJECTED
    app.save(update_fields=["status", "updated_at"])
    serializer = ApplicationDetailsSerializer(app)
    return Response(serializer.data)
