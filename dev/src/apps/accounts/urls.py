from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.registerView,  name='register'),
    path('login/', views.loginView, name='login'),
    path('logout/', views.logoutView, name='logout'),

    path('verify-email/<uidb64>/<token>/', views.verifyEmailView, name='verifyEmail'),

    path('reactivation/request/', views.requestReactivationView, name='requestReactivation'),
    path('reactivate/<uidb64>/<token>/', views.reactivateAccountView, name='reactivate'),

    path('account/delete/', views.deleteAccountView, name='accountDelete'),
    path('account/deactivate/', views.deactivateAccountView, name='accountDeactivate'),

    path('email/change/', views.changeEmailView, name='emailChange'),
    path('email/verify/<uidb64>/<token>/', views.verifyEmailChangeView, name='verifyEmailChange'),

    path('password/reset/', views.passwordResetRequestView, name='passwordReset'),
    path('password/reset/<uidb64>/<token>/', views.passwordResetConfirmView, name='passwordResetConfirm'),
    path('password/change/', views.passwordChangeView, name='passwordChange'),
    path('password/set/', views.setPasswordView, name='setPassword'),
]