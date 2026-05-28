from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from apps.accounts.models import Profile

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        
        # Only set or update the role for newly registered social accounts (not existing ones)
        if not sociallogin.is_existing:
            role_param = request.session.get('oauth_role', 'individual')
            role = Profile.Role.ENTERPRISE if role_param == 'enterprise' else Profile.Role.INDIVIDUAL
            
            # Ensure the profile exists and has the correct role
            profile, created = Profile.objects.get_or_create(user=user, defaults={'role': role})
            if not created and profile.role != role:
                profile.role = role
                profile.save(update_fields=['role'])
        
        return user
