from django.urls import path
from . import views

app_name = 'profiles'

urlpatterns = [
    path('', views.profileSetup, name='profileSetup'),
    path('post-setup/', views.postProfileSetup, name='postSetup'),
    path('edit/', views.profileEdit, name='profileEdit'),
    path('post-edit/', views.profileEdit, name='postProfileEdit'),
    path('skills/', views.searchOrCreateSkills, name='searchOrCreateSkills'),
    path('me/', views.myProfileDetails, name='myProfileDetails'),
    path('<str:uidb64>/', views.profileDetails, name='profileDetails'),
]