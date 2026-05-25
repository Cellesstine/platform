from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('apps.dashboard.urls')), 
    path('account/', include('apps.accounts.urls')),
    path('account/', include('allauth.urls')),
    path('profile/', include('apps.profiles.urls')),
    path('admin/', admin.site.urls),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)