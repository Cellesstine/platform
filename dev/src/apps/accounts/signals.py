from django.dispatch import receiver
from django.db.models.signals import post_save

from .models import Profile


@receiver(post_save, sender='socialaccount.SocialAccount')
def create_profile_for_oauth_user(sender, instance, created, **kwargs):
    if not created:
        return

    user = instance.user

    if not hasattr(user, 'profile'):
        Profile.objects.get_or_create(
            user=user,
            defaults={'role': Profile.Role.INDIVIDUAL},
        )