from django.urls import path

from . import views

app_name = 'jobs'

urlpatterns = [
    path('', views.AnnouncementListAPIView.as_view(), name='announcement-list-create'),
    path('search/', views.announcement_search, name='announcement-search'),

    path('applications/', views.ApplicationListAPIView.as_view(), name='application-list-create'),
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
    path(
        'applications/<uuid:pk>/',
        views.ApplicationDetailAPIView.as_view(),
        name='application-detail',
    ),

    path('<uuid:pk>/publish/', views.announcement_publish, name='announcement-publish'),
    path('<uuid:pk>/close/', views.announcement_close, name='announcement-close'),
    path('<uuid:pk>/', views.AnnouncementDetailAPIView.as_view(), name='announcement-detail'),
]
