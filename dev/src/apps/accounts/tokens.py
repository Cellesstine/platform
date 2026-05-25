from rest_framework_simplejwt.tokens import RefreshToken as BaseRefreshToken

class RoleAwareRefreshToken(BaseRefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        try:
            token['role'] = user.profile.role
        except Profile.DoesNotExist:
            token['role'] = None
        return token