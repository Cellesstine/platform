from rest_framework_simplejwt.tokens import RefreshToken as BaseRefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .models import Profile


class RoleAwareRefreshToken(BaseRefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        try:
            token['role'] = str(user.profile.role).lower()
        except Profile.DoesNotExist:
            token['role'] = None
        return token


class EmailChangeTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        login_timestamp = (
            ""
            if user.last_login is None
            else user.last_login.replace(microsecond=0, tzinfo=None)
        )
        email = user.pending_email or user.email
        return f"{user.pk}{user.password}{login_timestamp}{timestamp}{email}"


email_change_token_generator = EmailChangeTokenGenerator()