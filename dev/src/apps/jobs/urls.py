from django.urls import path
from . import views

app_name = "jobs"

urlpatterns = [
    # ── JobPost ──────────────────────────────────────────────────────
    path("",                                    views.job_post_list_create, name="job-post-list"),
    path("<uuid:pk>/",                          views.job_post_detail,      name="job-post-detail"),
    path("<uuid:pk>/publish/",                  views.job_post_publish,     name="job-post-publish"),
    path("<uuid:pk>/close/",                    views.job_post_close,       name="job-post-close"),

    # ── Applications ─────────────────────────────────────────────────
    path("applications/",                       views.application_list_create,   name="application-list"),
    path("applications/<uuid:pk>/",             views.application_detail,        name="application-detail"),
    path("applications/<uuid:pk>/reviewed/",    views.application_reviewed,      name="application-reviewed"),
    path("applications/<uuid:pk>/accept/",      views.application_accept,        name="application-accept"),
    path("applications/<uuid:pk>/reject/",      views.application_reject,        name="application-reject"),
]
