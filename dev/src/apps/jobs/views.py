from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.profiles.models import EnterpriseProfile

from .models import (
    Announcement,
    Application
    )

from .serializers import (
    AnnouncementSerializer,
    AnnouncementListSerializer,
    AnnouncementDetailSerializer,
    ApplicationSerializer,
    ApplicationDetailsSerializer,
    ApplicationStatusSerializer,
)


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

    # POST
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
    if exp_max:
        qs = qs.filter(
            Q(experience_required__lte=exp_max) | Q(experience_required__isnull=True)
        )
    if q:
        qs = qs.filter(
            Q(description__icontains=q)       |
            Q(address__icontains=q)            |
            Q(role__icontains=q)               |
            Q(industry__icontains=q)           |
            Q(enterprise__company_name__icontains=q) |
            Q(required_skills__name__icontains=q)
        ).distinct()

    serializer = AnnouncementListSerializer(qs, many=True)
    return Response({
        "count": qs.count(),
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

    # PUT / PATCH
    partial = (request.method == "PATCH")
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
    GET  /api/jobs/applications/?job_post=<id>   — list applications for an announcement
    GET  /api/jobs/applications/?applicant=<id>  — list applications by an applicant
    POST /api/jobs/applications/                 — submit an application
    """
    if request.method == "GET":
        qs = Application.objects.select_related("job_post", "applicant")

        job_post_id  = request.query_params.get("job_post")
        applicant_id = request.query_params.get("applicant")
        st           = request.query_params.get("status")

        if job_post_id:
            qs = qs.filter(job_post_id=job_post_id)
        if applicant_id:
            qs = qs.filter(applicant_id=applicant_id)
        if st:
            qs = qs.filter(status=st.upper())

        serializer = ApplicationDetailsSerializer(qs.order_by("-created_at"), many=True)
        return Response(serializer.data)

    # POST
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
    qs = Application.objects.select_related("job_post", "applicant", "job_post__enterprise")

    q            = request.query_params.get("q")
    st           = request.query_params.get("status")
    job_post_id  = request.query_params.get("job_post")
    applicant_id = request.query_params.get("applicant")

    if st:
        qs = qs.filter(status=st.upper())
    if job_post_id:
        qs = qs.filter(job_post_id=job_post_id)
    if applicant_id:
        qs = qs.filter(applicant_id=applicant_id)
    if q:
        qs = qs.filter(
            Q(cover_letter__icontains=q)                        |
            Q(job_post__description__icontains=q)               |
            Q(job_post__enterprise__company_name__icontains=q)  |
            Q(applicant__first_name__icontains=q)               |
            Q(applicant__last_name__icontains=q)
        ).distinct()

    serializer = ApplicationDetailsSerializer(qs.order_by("-created_at"), many=True)
    return Response({
        "count": qs.count(),
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
        Application.objects.select_related("job_post", "applicant"), pk=pk
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
    app = get_object_or_404(Application, pk=pk)
    app.status = "REVIEWED"
    app.save(update_fields=["status"])
    serializer = ApplicationDetailsSerializer(app)
    return Response(serializer.data)


@api_view(["PATCH"])
def application_accept(request, pk):
    """PATCH /api/jobs/applications/<id>/accept/"""
    app = get_object_or_404(Application, pk=pk)
    app.status = "ACCEPTED"
    app.save(update_fields=["status"])
    serializer = ApplicationDetailsSerializer(app)
    return Response(serializer.data)


@api_view(["PATCH"])
def application_reject(request, pk):
    """PATCH /api/jobs/applications/<id>/reject/"""
    app = get_object_or_404(Application, pk=pk)
    app.status = "REJECTED"
    app.save(update_fields=["status"])
    serializer = ApplicationDetailsSerializer(app)
    return Response(serializer.data)
