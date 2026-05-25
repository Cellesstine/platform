from .models import Profile
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

User = get_user_model()

ROLE_MAP = {
    'individual': Profile.Role.INDIVIDUAL,
    'enterprise': Profile.Role.ENTERPRISE,
}

def decode_uid(uidb64):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        return User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None

def send_verification_email(request, user):
    current_site = get_current_site(request)

    message = render_to_string('emails/verification_email.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http',
    })

    send_mail(
        subject="verify account",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
    )

def send_reactivation_email(request, user):
    current_site = get_current_site(request)

    message = render_to_string('emails/reactivation_email.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http',
    })

    send_mail(
        subject="account reactivation",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
    )

def send_email_change_verification(request, user):
    current_site = get_current_site(request)

    message = render_to_string('emails/email_change_verification.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http',
    })

    send_mail(
        subject="confirm new email address",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.pending_email],
        html_message=message
    )

def send_password_reset_email(request, user):
    current_site = get_current_site(request)
    message = render_to_string('emails/password_reset_email.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': default_token_generator.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http',
    })
    send_mail(
        subject="Reset your password",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
    )