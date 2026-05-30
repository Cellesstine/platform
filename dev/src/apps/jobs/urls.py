from django.urls import path

from . import views

app_name = 'jobs'

urlpatterns = [
    # ── Announcements ─────────────────────────────────────────────────
    path('', views.announcement_list_create, name='announcement-list-create'),
    path('search/', views.announcement_search, name='announcement-search'),

    # ── Applications (before <uuid:pk>/ so "applications" is not parsed as pk)
    path('applications/', views.application_list_create, name='application-list-create'),
    path('applications/search/', views.application_search, name='application-search'),
    path(
        'applications/<uuid:pk>/reviewed/',
        views.application_reviewed,
        name='application-reviewed',
    ),
    path(
        'applications/<uuid:pk>/accept/',
        views.application_accept,
        name='application-accept',
    ),
    path(
        'applications/<uuid:pk>/reject/',
        views.application_reject,
        name='application-reject',
    ),
    path('applications/<uuid:pk>/', views.application_detail, name='application-detail'),

    # ── Announcement detail & actions (after static / application paths)
    path('<uuid:pk>/publish/', views.announcement_publish, name='announcement-publish'),
    path('<uuid:pk>/close/', views.announcement_close, name='announcement-close'),
    path('<uuid:pk>/', views.announcement_detail, name='announcement-detail'),
]
