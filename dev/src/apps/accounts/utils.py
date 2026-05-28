from urllib.parse import quote, urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import Profile

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


def _frontend_origin():
    return settings.FRONTEND_URL.rstrip("/")


def build_frontend_account_link(path, query=None):
    """Build an absolute URL on the React app (FRONTEND_URL + /account/... path)."""
    url = f"{_frontend_origin()}{path}"
    if query:
        url = f"{url}?{urlencode(query)}"
    return url


def _portal_for_user(user):
    if not hasattr(user, "profile"):
        return "business"
    if user.profile.role == Profile.Role.INDIVIDUAL:
        return "professional"
    return "business"


def build_account_action_url(link_type, uidb64, token, portal=None):
    """
    link_type: verify-email | reactivate | password-reset | email-verify
    """
    token_quoted = quote(token, safe="")
    paths = {
        "verify-email": f"/account/verify-email/{uidb64}/{token_quoted}",
        "reactivate": f"/account/reactivate/{uidb64}/{token_quoted}",
        "password-reset": f"/account/password/reset/{uidb64}/{token_quoted}",
        "email-verify": f"/account/email/verify/{uidb64}/{token_quoted}",
    }
    query = None
    if link_type == "verify-email" and portal == "professional":
        query = {"portal": "professional"}
    return build_frontend_account_link(paths[link_type], query)


def _email_context(user, uidb64, token, link_type, portal=None):
    if portal is None and link_type == "verify-email":
        portal = _portal_for_user(user)
    return {
        "user": user,
        "uid": uidb64,
        "action_url": build_account_action_url(link_type, uidb64, token, portal),
    }


def send_verification_email(request, user, portal=None):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    if portal is None:
        portal = _portal_for_user(user)

    context = _email_context(user, uidb64, token, "verify-email", portal)
    message = render_to_string("emails/verification_email.html", context)

    send_mail(
        subject="Verify your Linkio account",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
    )


def send_reactivation_email(request, user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    context = _email_context(user, uidb64, token, "reactivate")

    message = render_to_string("emails/reactivation_email.html", context)

    send_mail(
        subject="Reactivate your Linkio account",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
    )


def send_email_change_verification(request, user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    context = _email_context(user, uidb64, token, "email-verify")

    message = render_to_string("emails/email_change_verification.html", context)

    send_mail(
        subject="Confirm your new email address",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.pending_email],
        html_message=message,
    )


def send_password_reset_email(request, user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    context = _email_context(user, uidb64, token, "password-reset")

    message = render_to_string("emails/password_reset_email.html", context)
    send_mail(
        subject="Reset your Linkio password",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=message,
    )
