from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Announcement, Application
from .serializers import (
    AnnouncementSerializer,
    AnnouncementListSerializer,
    AnnouncementDetailSerializer,
    ApplicationSerializer,
    ApplicationDetailsSerializer,
)
from .utils import ApplicationStatus


def _announcement_queryset():
    return Announcement.objects.select_related("enterprise").prefetch_related("required_skills")


class AnnouncementListAPIView(APIView):
    """GET /api/jobs/ — list | POST /api/jobs/ — create"""

    def get(self, request):
        qs = _announcement_queryset()
        params = request.query_params

        st = params.get("status", "ACTIVE").upper()
        if st != "ALL":
            qs = qs.filter(status=st)
        if industry := params.get("industry"):
            qs = qs.filter(industry=industry.upper())
        if role := params.get("role"):
            qs = qs.filter(role=role.upper())
        if wilaya := params.get("wilaya"):
            qs = qs.filter(wilaya=wilaya)
        if job_type := params.get("job_type"):
            qs = qs.filter(job_type=job_type.upper())
        if enterprise := params.get("enterprise"):
            qs = qs.filter(enterprise_id=enterprise)
        if search := params.get("search"):
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(address__icontains=search) |
                Q(enterprise__company_name__icontains=search)
            )

        serializer = AnnouncementListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save()
            return Response(    
                AnnouncementDetailSerializer(post).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def announcement_search(request):
    """GET /api/jobs/search/"""
    qs = _announcement_queryset()

    q = request.query_params.get("q")
    industry = request.query_params.get("industry")
    role = request.query_params.get("role")
    wilaya = request.query_params.get("wilaya")
    job_type = request.query_params.get("job_type")
    st = request.query_params.get("status", "ACTIVE").upper()
    exp_max = request.query_params.get("exp_max")

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
            Q(title__icontains=q) |
            Q(description__icontains=q) |
            Q(address__icontains=q) |
            Q(role__icontains=q) |
            Q(industry__icontains=q) |
            Q(enterprise__company_name__icontains=q) |
            Q(required_skills__name__icontains=q)
        ).distinct()

    results = list(qs)
    return Response({
        "count": len(results),
        "results": AnnouncementListSerializer(results, many=True).data,
    })


class AnnouncementDetailAPIView(APIView):
    """GET / PUT / PATCH / DELETE /api/jobs/<id>/"""

    def _get_post(self, pk):
        return get_object_or_404(_announcement_queryset(), pk=pk)

    def get(self, request, pk):
        post = self._get_post(pk)
        return Response(AnnouncementDetailSerializer(post).data)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        post = self._get_post(pk)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _update(self, request, pk, partial):
        post = self._get_post(pk)
        serializer = AnnouncementSerializer(post, data=request.data, partial=partial)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(AnnouncementDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def announcement_publish(request, pk):
    post = get_object_or_404(Announcement, pk=pk)
    if post.is_active():
        return Response(
            {"detail": "Announcement is already active."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    post.publish()
    return Response(AnnouncementDetailSerializer(post).data)


@api_view(["POST"])
def announcement_close(request, pk):
    post = get_object_or_404(Announcement, pk=pk)
    if post.is_closed():
        return Response(
            {"detail": "Announcement is already closed."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    post.close()
    return Response(AnnouncementDetailSerializer(post).data)


class ApplicationListAPIView(APIView):
    def get(self, request):
        announcement_id = request.query_params.get("announcement")
        applicant_id = request.query_params.get("applicant")
        st = request.query_params.get("status")

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

    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            app = serializer.save()
            return Response(
                ApplicationDetailsSerializer(app).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def application_search(request):
    qs = Application.objects.select_related(
        "announcement", "applicant", "announcement__enterprise"
    )

    q = request.query_params.get("q")
    st = request.query_params.get("status")
    announcement_id = request.query_params.get("announcement")
    applicant_id = request.query_params.get("applicant")

    if st:
        qs = qs.filter(status=st.upper())
    if announcement_id:
        qs = qs.filter(announcement_id=announcement_id)
    if applicant_id:
        qs = qs.filter(applicant_id=applicant_id)
    if q:
        qs = qs.filter(
            Q(cover_letter__icontains=q) |
            Q(announcement__title__icontains=q) |
            Q(announcement__description__icontains=q) |
            Q(announcement__enterprise__company_name__icontains=q) |
            Q(applicant__first_name__icontains=q) |
            Q(applicant__last_name__icontains=q)
        ).distinct()

    results = list(qs.order_by("-created_at"))
    return Response({
        "count": len(results),
        "results": ApplicationDetailsSerializer(results, many=True).data,
    })


class ApplicationDetailAPIView(APIView):
    def _get_app(self, pk):
        return get_object_or_404(
            Application.objects.select_related("announcement", "applicant"),
            pk=pk,
        )

    def get(self, request, pk):
        return Response(ApplicationDetailsSerializer(self._get_app(pk)).data)

    def delete(self, request, pk):
        self._get_app(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["PATCH"])
def application_reviewed(request, pk):
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )
    app.status = ApplicationStatus.REVIEWED
    app.save(update_fields=["status", "updated_at"])
    return Response(ApplicationDetailsSerializer(app).data)


@api_view(["PATCH"])
def application_accept(request, pk):
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )
    app.status = ApplicationStatus.ACCEPTED
    app.save(update_fields=["status", "updated_at"])
    return Response(ApplicationDetailsSerializer(app).data)


@api_view(["PATCH"])
def application_reject(request, pk):
    app = get_object_or_404(
        Application.objects.select_related("announcement", "applicant"),
        pk=pk,
    )
    app.status = ApplicationStatus.REJECTED
    app.save(update_fields=["status", "updated_at"])
    return Response(ApplicationDetailsSerializer(app).data)
