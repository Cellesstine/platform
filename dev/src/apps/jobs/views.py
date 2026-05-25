from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.profiles.models import EnterpriseProfile

from .models import JobPost, Application
from .serializers import (
    serialize_job_post_list,
    serialize_job_post_detail,
    deserialize_job_post,
    serialize_application,
    deserialize_application,
)


# ─────────────────────────────────────────────
# JobPost — List / Create
# ─────────────────────────────────────────────

@api_view(["GET", "POST"])
def job_post_list_create(request):
    """
    GET  /api/jobs/   — list job posts
    POST /api/jobs/   — create a job post
    """
    if request.method == "GET":
        qs = JobPost.objects.select_related("enterprise").prefetch_related("required_skills")

        st         = request.query_params.get("status", "active")
        industry   = request.query_params.get("industry")
        role       = request.query_params.get("role")
        wilaya     = request.query_params.get("wilaya")
        job_type   = request.query_params.get("job_type")
        enterprise = request.query_params.get("enterprise")
        search     = request.query_params.get("search")

        if st != "all":
            qs = qs.filter(status=st)
        if industry:
            qs = qs.filter(industry=industry)
        if role:
            qs = qs.filter(role=role)
        if wilaya:
            qs = qs.filter(wilaya=wilaya)
        if job_type:
            qs = qs.filter(job_type=job_type)
        if enterprise:
            qs = qs.filter(enterprise_id=enterprise)
        if search:
            qs = qs.filter(
                Q(description__icontains=search) |
                Q(address__icontains=search) |
                Q(enterprise__company_name__icontains=search)
            )

        return Response([serialize_job_post_list(p) for p in qs])

    # POST
    try:
        cleaned = deserialize_job_post(request.data)

        # required_skills is ManyToMany — must be set after create()
        required_skills = request.data.get("required_skills", [])

        enterprise_id = request.data.get("enterprise")
        enterprise = get_object_or_404(EnterpriseProfile, pk=enterprise_id)

        post = JobPost.objects.create(enterprise=enterprise, **cleaned)

        if required_skills:
            post.required_skills.set(required_skills)

        return Response(serialize_job_post_detail(post), status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# JobPost — Retrieve / Update / Delete
# ─────────────────────────────────────────────

@api_view(["GET", "PUT", "PATCH", "DELETE"])
def job_post_detail(request, pk):
    """
    GET    /api/jobs/<id>/
    PUT    /api/jobs/<id>/
    PATCH  /api/jobs/<id>/
    DELETE /api/jobs/<id>/
    """
    post = get_object_or_404(
        JobPost.objects.select_related("enterprise").prefetch_related("required_skills"),
        pk=pk,
    )

    if request.method == "GET":
        return Response(serialize_job_post_detail(post))

    if request.method == "DELETE":
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT / PATCH
    try:
        cleaned = deserialize_job_post(request.data, instance=post)
        required_skills = request.data.get("required_skills")

        for attr, value in cleaned.items():
            setattr(post, attr, value)
        post.save()

        if required_skills is not None:
            post.required_skills.set(required_skills)

        return Response(serialize_job_post_detail(post))
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# JobPost — Publish / Close
# ─────────────────────────────────────────────

@api_view(["POST"])
def job_post_publish(request, pk):
    """POST /api/jobs/<id>/publish/"""
    post = get_object_or_404(JobPost, pk=pk)
    if post.is_active():
        return Response(
            {"detail": "Job post is already active."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    post.publish()
    return Response(serialize_job_post_detail(post))


@api_view(["POST"])
def job_post_close(request, pk):
    """POST /api/jobs/<id>/close/"""
    post = get_object_or_404(JobPost, pk=pk)
    if post.is_closed():
        return Response(
            {"detail": "Job post is already closed."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    post.close()
    return Response(serialize_job_post_detail(post))


# ─────────────────────────────────────────────
# Applications — List / Create
# ─────────────────────────────────────────────

@api_view(["GET", "POST"])
def application_list_create(request):
    """
    GET  /api/jobs/applications/?job_post=<id>   — list applications for a job post
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
            qs = qs.filter(status=st)

        return Response([serialize_application(a) for a in qs.order_by("-created_at")])

    # POST
    try:
        cleaned = deserialize_application(request.data)
        app = Application.objects.create(**cleaned)
        return Response(serialize_application(app), status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


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
        return Response(serialize_application(app))

    app.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# Applications — Status Actions
# ─────────────────────────────────────────────

@api_view(["PATCH"])
def application_reviewed(request, pk):
    """PATCH /api/jobs/applications/<id>/reviewed/"""
    app = get_object_or_404(Application, pk=pk)
    app.reviewed()
    return Response(serialize_application(app))


@api_view(["PATCH"])
def application_accept(request, pk):
    """PATCH /api/jobs/applications/<id>/accept/"""
    app = get_object_or_404(Application, pk=pk)
    app.accept()
    return Response(serialize_application(app))


@api_view(["PATCH"])
def application_reject(request, pk):
    """PATCH /api/jobs/applications/<id>/reject/"""
    app = get_object_or_404(Application, pk=pk)
    app.reject()
    return Response(serialize_application(app))
