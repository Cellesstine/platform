from rest_framework_simplejwt.tokens import RefreshToken as BaseRefreshToken

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