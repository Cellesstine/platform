from django.urls import path
from . import views

app_name = 'profiles'

urlpatterns = [
    path('', views.profileSetup, name='profileSetup'),
    path('post-setup/', views.postProfileSetup, name='postSetup'),
    path('edit/', views.profileEdit, name='profileEdit'),
    path('post-edit/', views.profileEdit, name='postProfileEdit'),
    #path('<uuid:pk>/', views.profile_details, name='profile_details'),
    #path('my_profile/', views.self_profile, name='my_profile'),
]