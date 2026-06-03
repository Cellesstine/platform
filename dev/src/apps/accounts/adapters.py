from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from apps.accounts.models import Profile
from django.http import HttpResponseRedirect
from django.conf import settings
from allauth.core.exceptions import ImmediateHttpResponse
from django.contrib.auth import get_user_model

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # 1. Block signup if the requested session role is enterprise
        role_param = request.session.get('oauth_role', 'individual')
        if role_param == 'enterprise':
            raise ImmediateHttpResponse(
                HttpResponseRedirect(f"{settings.FRONTEND_URL}/sign-in?error=oauth_only_for_professionals")
            )

        # 2. Block login if the existing social user is an enterprise account
        if sociallogin.is_existing:
            user = sociallogin.user
            if hasattr(user, 'profile') and user.profile.role != Profile.Role.INDIVIDUAL:
                raise ImmediateHttpResponse(
                    HttpResponseRedirect(f"{settings.FRONTEND_URL}/sign-in?error=oauth_only_for_professionals")
                )
        else:
            # 3. Block login/signup if there's an existing user with the same email in the DB
            # who is registered as an enterprise user (e.g. to prevent auto-connecting)
            email = None
            if sociallogin.user and sociallogin.user.email:
                email = sociallogin.user.email
            elif sociallogin.email_addresses:
                for email_address in sociallogin.email_addresses:
                    if email_address.email:
                        email = email_address.email
                        break
            
            if email:
                User = get_user_model()
                try:
                    existing_user = User.objects.get(email__iexact=email)
                    if hasattr(existing_user, 'profile') and existing_user.profile.role != Profile.Role.INDIVIDUAL:
                        raise ImmediateHttpResponse(
                            HttpResponseRedirect(f"{settings.FRONTEND_URL}/sign-in?error=oauth_only_for_professionals")
                        )
                except User.DoesNotExist:
                    pass

    def save_user(self, request, sociallogin, form=None):
        # Determine if the social login is existing BEFORE super().save_user saves the user to the DB
        is_existing = sociallogin.is_existing
        
        user = super().save_user(request, sociallogin, form)
        
        # Only set or update the role for newly registered social accounts (not existing ones)
        if not is_existing:
            role = Profile.Role.INDIVIDUAL
            
            # Ensure the profile exists and has the correct role
            profile, created = Profile.objects.get_or_create(user=user, defaults={'role': role})
            if not created and profile.role != role:
                profile.role = role
                profile.save(update_fields=['role'])
        
        return user
